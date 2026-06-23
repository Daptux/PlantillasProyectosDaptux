# Requerimientos — OdontoAdmin Pro

## Objetivo
Plataforma web para una clínica odontológica con **landing pública** (captación de
pacientes y reserva de citas) y **panel administrativo** (gestión integral de la clínica).

## Stack
- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios.
- **Backend:** Node.js + Express + JWT.
- **Base de datos:** MySQL puro (driver `mysql2`, sin ORM).
- **Autenticación:** JWT + bcrypt.

## Módulos funcionales
1. Landing pública (hero, servicios, equipo, galería, testimonios, proceso, FAQ, contacto).
2. Reserva de citas desde la web.
3. Dashboard de métricas.
4. Gestión de usuarios y roles.
5. Gestión de pacientes (con buscador y vista detalle).
6. Gestión de odontólogos.
7. Gestión de servicios (catálogo + visibilidad en landing).
8. Gestión de citas con estados y validaciones.
9. Historia clínica y evoluciones (registros inmutables).
10. Odontograma visual por paciente.
11. Planes de tratamiento con presupuesto.
12. Pagos, abonos y saldos.
13. Inventario con movimientos y alertas de stock.
14. Contenido web editable (config, testimonios, FAQs, galería).
15. Reportes básicos (citas e ingresos).

## Requisitos no funcionales
- Código modular y comentado.
- Diseño moderno, profesional y responsive.
- Sistema parametrizable (nombre, logo, colores, contacto) desde `configuracion_clinica`.
- Validaciones en backend (campos obligatorios, correos/teléfonos, documentos únicos,
  citas sin solapamiento, stock no negativo, pagos no negativos, estados controlados).
- Soft delete en registros sensibles; historia clínica nunca se elimina.

## Validaciones implementadas (backend)
- Campos obligatorios por entidad.
- Correo y formato de documento únicos.
- Fechas de cita no pasadas y sin doble reserva del mismo odontólogo.
- Stock no negativo (transacción en movimientos de inventario).
- Montos de pago > 0.
- Estados restringidos a los valores válidos (ENUM + validación en controladores).
