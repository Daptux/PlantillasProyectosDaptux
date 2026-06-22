# Requerimientos — OdontoAdmin Pro

## Objetivo

Plataforma completa para una clínica odontológica con **landing pública** (captación de
pacientes) y **panel administrativo** (gestión integral de la clínica).

## Requerimientos funcionales

### Web pública
- RF-01 Landing con hero, servicios, equipo, galería, testimonios, proceso, FAQ y contacto.
- RF-02 Formulario público de reserva de cita (estado `SOLICITADA`).
- RF-03 Contenido editable desde el panel (servicios, galería, testimonios, FAQs, config).
- RF-04 Botón flotante de WhatsApp y datos de contacto dinámicos.

### Panel administrativo
- RF-05 Autenticación con JWT y rutas protegidas por rol.
- RF-06 Dashboard con métricas operativas y financieras.
- RF-07 CRUD de usuarios con roles.
- RF-08 CRUD de pacientes con búsqueda y ficha completa.
- RF-09 CRUD de odontólogos y especialidades.
- RF-10 CRUD de servicios (visibles/ocultos en web).
- RF-11 Gestión de citas con estados y validación de agenda.
- RF-12 Historia clínica + evoluciones (append-only).
- RF-13 Odontograma visual por paciente.
- RF-14 Planes de tratamiento con presupuesto y detalle.
- RF-15 Pagos, abonos y cálculo de saldos.
- RF-16 Inventario con movimientos y alertas.
- RF-17 Reportes y seguimiento de pacientes.

## Requerimientos no funcionales

- RNF-01 Backend en Node.js + Express con **MySQL puro** (sin ORM).
- RNF-02 Frontend en React + Vite + Tailwind, responsive y moderno.
- RNF-03 Contraseñas con bcrypt; comunicación protegida con JWT.
- RNF-04 Base de datos InnoDB + utf8mb4, con índices y llaves foráneas.
- RNF-05 Soft delete para registros sensibles; historia clínica no eliminable.
- RNF-06 Código modular, comentado y mantenible.
- RNF-07 Marca configurable (nombre, logo, colores, contacto) desde el panel.

## Entidades principales

`roles`, `usuarios`, `especialidades`, `odontologos`, `pacientes`, `servicios`,
`citas`, `historias_clinicas`, `evoluciones_clinicas`, `odontograma`,
`planes_tratamiento`, `detalle_planes_tratamiento`, `pagos`, `inventario`,
`movimientos_inventario`, `proveedores`, `galeria`, `testimonios`,
`preguntas_frecuentes`, `blog_posts`, `configuracion_clinica`, `logs_actividad`.

Ver el modelo completo en [`database/schema.sql`](../database/schema.sql).
