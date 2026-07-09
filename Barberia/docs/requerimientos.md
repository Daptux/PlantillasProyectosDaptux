# Requerimientos — BarberPro Studio

## Objetivo
Sistema web integral para barberías con parte pública (clientes) y panel administrativo,
reutilizable como plantilla para múltiples negocios.

## Roles

| Rol | Acceso |
|-----|--------|
| **Superadmin / Dueño** | Todo, incluida configuración crítica y usuarios |
| **Administrador** | Operación general (reservas, clientes, servicios, barberos, finanzas, inventario) |
| **Barbero** | Su agenda, sus citas y sus reportes/comisiones |
| **Recepcionista** | Reservas, clientes y caja básica |
| **Cliente** (opcional) | Sus propias reservas e historial |

Los permisos se definen en `lib/permissions.ts` y se validan en frontend (ocultar UI) y en
los Route Handlers (`requirePermiso`). RLS en la base de datos refuerza el aislamiento.

## Parte pública
- **Landing**: hero, servicios destacados, por qué elegirnos, barberos, galería, promociones,
  testimonios, ubicación, horarios, FAQ, footer.
- **Servicios**: catálogo por categorías con precio y duración.
- **Barberos**: perfiles con especialidad y valoración.
- **Reservar**: flujo de 5 pasos (servicio → barbero → fecha/hora → datos → confirmar).
- **Promociones**, **Galería** (con filtros), **Contacto** (formulario → lead + WhatsApp).

## Panel administrativo (módulos)
1. **Dashboard** — KPIs, gráfica de ingresos, próximas citas, stock bajo, tops.
2. **Reservas** — listado con filtros y cambio de estado.
3. **Agenda** — vista diaria por barbero.
4. **Clientes (CRM)** — historial, segmentos, contacto por WhatsApp.
5. **Servicios** — CRUD con categorías, precio, duración, comisión.
6. **Barberos** — CRUD con comisión, especialidad, estado.
7. **Finanzas** — ingresos/gastos, utilidad, movimientos.
8. **Caja** — apertura/cierre con balance.
9. **Inventario** — productos, stock y alertas.
10. **Ventas** — venta de productos con descuento de inventario.
11. **Promociones**, **Galería**, **Testimonios** — CRUD para la web.
12. **Reportes** — citas por estado, servicios/barberos/clientes top, stock bajo.
13. **Configuración** — marca, contacto, reglas de reserva.
14. **Usuarios** — cuentas y roles (crea usuarios de Supabase Auth).

## Automatizaciones
- Reserva **completada** → registra ingreso + comisión del barbero + actualiza métricas del cliente (trigger `reservas_al_completar`).
- **Venta de producto** → descuenta inventario + registra ingreso.
- **Stock bajo** → alerta en dashboard y badge en inventario.
- Anti-solapamiento de reservas por barbero (trigger `reservas_validar_solapamiento`).
