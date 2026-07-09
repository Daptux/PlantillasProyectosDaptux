# Flujo de reservas — BarberPro Studio

## Pasos (cliente, `/reservar`)

1. **Servicio** — elige uno de los servicios activos.
2. **Barbero** — selecciona uno o "Cualquiera disponible".
3. **Fecha y hora** — al elegir fecha se consulta
   `GET /api/disponibilidad?servicio_id=&barbero_id=&fecha=` y se muestran los slots libres.
4. **Datos** — nombre, celular/WhatsApp, correo (opcional), observaciones.
5. **Confirmar** — resumen y envío a `POST /api/reservas`.

## Motor de disponibilidad (`lib/disponibilidad.ts`)

Para cada barbero candidato (que **realice** el servicio) calcula:

1. **Duración** del servicio → tamaño del bloque.
2. **Anticipación mínima** (`configuracion_barberia.anticipacion_minima_min`) → descarta slots muy próximos.
3. **Horario** del barbero ese día de la semana (`horarios_barberos`).
4. Genera slots cada 15 min tales que `inicio + duración ≤ fin de jornada`.
5. Descarta slots que **solapan** con:
   - reservas en estado `pendiente | confirmada | en_proceso`,
   - bloqueos de agenda (`bloqueos_agenda`, del barbero o de toda la barbería).
6. Para "Cualquiera": devuelve un slot por hora (el primer barbero libre).

> Zona horaria: Colombia (UTC-5, sin horario de verano). Las horas `time` se convierten a
> ISO con offset `-05:00` para comparar contra los `timestamptz`.

## Creación (`POST /api/reservas`)

1. Valida el payload con `reservaPublicaSchema` (Zod).
2. Carga el servicio (precio + duración) y calcula `hora_fin`.
3. Resuelve el barbero (o el primero disponible que haga el servicio).
4. Verifica que el barbero **realice** el servicio (`barbero_servicios`).
5. Revalida solapamiento (defensa extra al trigger de la BD).
6. Define estado según `reserva_automatica`: `confirmada` o `pendiente`.
7. Busca/crea el cliente por celular.
8. Inserta la reserva (`origen = publico`) con el **service role**.

## Validaciones clave
- Campos requeridos y formato de celular/correo (Zod).
- Servicio activo y existente.
- Barbero habilitado para el servicio.
- Sin conflicto de horario (código app **y** trigger `reservas_validar_solapamiento`).
- No se reserva en horarios fuera de jornada ni sobre bloqueos.

## Al completar una reserva (panel)
`PATCH /api/reservas/[id]/estado` → `completada` dispara el trigger `reservas_al_completar`:
registra el **ingreso**, calcula la **comisión** del barbero y actualiza **visitas/gasto** del cliente.
