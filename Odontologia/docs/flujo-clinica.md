# Flujo de la clínica — OdontoAdmin Pro

## 1. Captación del paciente (web pública)

1. El visitante navega la landing (`/`), explora servicios, equipo y testimonios.
2. Hace clic en **Agendar cita** → formulario `/reservar-cita`.
3. Envía la solicitud → se crea una cita en estado **SOLICITADA** y origen **WEB**
   (aún sin paciente asociado, solo datos de contacto).

## 2. Confirmación (recepción)

1. Recepcionista/Admin ve la cita en **Citas** (filtro estado = `SOLICITADA`).
2. Crea o asocia el **paciente** y asigna **odontólogo**, **servicio** y horario.
3. Cambia el estado a **CONFIRMADA** (el sistema valida que no haya doble reserva
   del mismo odontólogo en la misma franja horaria).

## 3. Atención (día de la cita)

```
CONFIRMADA → EN_ESPERA → EN_ATENCION → FINALIZADA
```

- **EN_ESPERA:** el paciente llegó (check-in).
- **EN_ATENCION:** el odontólogo inicia la consulta.
- Durante la atención, el odontólogo puede:
  - Actualizar la **historia clínica**.
  - Registrar una **evolución** (procedimiento, diagnóstico, recomendaciones).
  - Actualizar el **odontograma** (estado de cada pieza).
  - Crear/avanzar un **plan de tratamiento**.
- **FINALIZADA:** termina la atención.

Estados alternos: **CANCELADA**, **NO_ASISTIO**, **REPROGRAMADA**.

## 4. Plan de tratamiento y presupuesto

1. El odontólogo crea un **plan** para el paciente (estado `PROPUESTO`).
2. Agrega procedimientos (servicio, diente, precio, cantidad) → el sistema calcula
   total, descuento y total final (presupuesto visual).
3. El paciente acepta → estado `ACEPTADO` → `EN_PROCESO` → `FINALIZADO`.

## 5. Pagos y saldos

1. En **Pagos** se registran abonos (asociados al paciente y opcionalmente al plan).
2. El sistema calcula automáticamente:
   - Total de tratamientos del paciente.
   - Total abonado.
   - **Saldo pendiente**.

## 6. Inventario

- Cada uso de insumos se registra como **SALIDA**; las compras como **ENTRADA**.
- El stock se actualiza en una **transacción** y nunca queda negativo.
- Alertas automáticas: stock bajo, productos vencidos y próximos a vencer (30 días).

## 7. Seguimiento

El módulo de **Reportes/Seguimiento** identifica:
- Pacientes con tratamientos incompletos.
- Pacientes con saldo pendiente.
- Pacientes que no asistieron.
- Pacientes sin cita futura (para reactivar).
- Presupuestos pendientes por aceptar.

## Reglas de negocio clave

- Un paciente → muchas citas; una cita → un paciente, un odontólogo y un servicio.
- Un paciente → **una** historia clínica principal → muchas evoluciones.
- Un paciente → muchos registros de odontograma (uno por diente) y varios planes.
- Un pago → un paciente y, opcionalmente, un plan/cita.
- No se permiten citas en fechas pasadas ni doble reserva del mismo odontólogo.
- Stock nunca negativo; pagos nunca negativos.
