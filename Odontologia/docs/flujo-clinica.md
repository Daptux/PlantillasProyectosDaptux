# Flujo de la clínica — OdontoAdmin Pro

## 1. Captación del paciente (landing)
1. El visitante navega la landing y revisa servicios, equipo y testimonios.
2. Completa el **formulario de reserva** (`/reservar-cita`) o escribe por WhatsApp.
3. La cita se crea en estado **SOLICITADA** con origen `WEB`.

## 2. Confirmación (recepción)
1. Recepción ve las citas SOLICITADAS en el panel (`/admin/citas`).
2. Registra/asocia al paciente (si es nuevo) y asigna odontólogo, servicio, fecha y hora.
3. Cambia el estado a **CONFIRMADA** (no se permite doble cita del mismo odontólogo
   en el mismo horario, ni fechas pasadas).

## 3. Atención (día de la cita)
1. A la llegada del paciente: estado **EN_ESPERA**.
2. Cuando pasa al consultorio: **EN_ATENCION**.
3. El odontólogo registra:
   - Historia clínica (si es la primera vez).
   - **Evolución clínica** de la cita (procedimiento, diagnóstico, recomendaciones).
   - **Odontograma** (estado de cada pieza dental).
   - **Plan de tratamiento** con su presupuesto, si aplica.
4. Al terminar: estado **FINALIZADA**.

## 4. Plan de tratamiento y pagos
1. El plan inicia en **PROPUESTO**; al aceptarlo el paciente pasa a **ACEPTADO**.
2. Caja registra **pagos/abonos**; el sistema calcula el **saldo pendiente**
   (total de planes aceptados − total abonado).
3. A medida que se realizan procedimientos, el plan avanza a **EN_PROCESO** y
   finalmente **FINALIZADO**.

## 5. Seguimiento
- Pacientes con tratamientos incompletos, saldos pendientes o sin próxima cita.
- Controles y limpiezas periódicas (próxima cita sugerida en cada evolución).

## Reglas de negocio clave
- La **historia clínica no se elimina** físicamente; las correcciones se hacen
  con nuevas evoluciones (registros inmutables).
- Los servicios pueden estar **activos/inactivos** y **visibles/ocultos** en la landing.
- El **stock no puede quedar negativo**; cada entrada/salida queda registrada.
- Toda acción sensible puede registrarse en `logs_actividad`.

## Estados

**Citas:** SOLICITADA → CONFIRMADA → EN_ESPERA → EN_ATENCION → FINALIZADA
(además: CANCELADA, NO_ASISTIO, REPROGRAMADA).

**Plan:** PROPUESTO → ACEPTADO → EN_PROCESO → FINALIZADO (o CANCELADO).

**Detalle del plan:** PENDIENTE → EN_PROCESO → REALIZADO (o CANCELADO).
