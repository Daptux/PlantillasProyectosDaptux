# Endpoints de la API — OdontoAdmin Pro

Base URL: `http://localhost:4000/api`

Todas las respuestas siguen el formato:
```json
{ "ok": true, "data": ... }      // éxito
{ "ok": false, "mensaje": "..." } // error
```

Los endpoints **protegidos** requieren el header:
```
Authorization: Bearer <token>
```

Los marcados como 🌐 **públicos** no requieren token (se usan en la landing).

---

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | 🌐 Inicia sesión. Body: `{ correo, password }`. Devuelve `token` y `usuario`. |
| GET | `/auth/profile` | Perfil del usuario autenticado. |

## Usuarios (ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Lista usuarios. |
| GET | `/usuarios/:id` | Obtiene un usuario. |
| POST | `/usuarios` | Crea usuario. Body: `{ nombre, correo, password, rol_id, telefono }`. |
| PUT | `/usuarios/:id` | Actualiza usuario. |
| DELETE | `/usuarios/:id` | Desactiva usuario (soft delete). |
| GET | `/usuarios/roles/all` | Lista de roles. |

## Pacientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pacientes?buscar=&estado=` | Lista/búsqueda por nombre, documento o teléfono. |
| GET | `/pacientes/:id` | Detalle de paciente (incluye edad calculada). |
| POST | `/pacientes` | Crea paciente. |
| PUT | `/pacientes/:id` | Actualiza paciente. |
| DELETE | `/pacientes/:id` | Inactiva paciente (soft delete). |

## Odontólogos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/odontologos/publicos` | 🌐 Odontólogos visibles en la landing. |
| GET | `/odontologos` | Lista (admin). |
| GET | `/odontologos/:id` | Detalle + servicios. |
| POST | `/odontologos` | Crea (ADMIN). |
| PUT | `/odontologos/:id` | Actualiza (ADMIN). |
| DELETE | `/odontologos/:id` | Inactiva (ADMIN). |
| GET | `/odontologos/especialidades/all` | Lista de especialidades. |

## Servicios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/servicios/publicos` | 🌐 Servicios activos y visibles. |
| GET | `/servicios` | Todos (admin). |
| GET | `/servicios/:id` | Detalle. |
| POST/PUT/DELETE | `/servicios/:id` | CRUD (ADMIN). |

## Citas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/citas/solicitud` | 🌐 Solicitud desde la web (queda en estado `SOLICITADA`). |
| GET | `/citas?fecha=&estado=&odontologo_id=&paciente_id=` | Lista con filtros. |
| GET | `/citas/:id` | Detalle. |
| POST | `/citas` | Crea cita (valida agenda y fechas). |
| PUT | `/citas/:id` | Actualiza (valida doble reserva). |
| PATCH | `/citas/:id/estado` | Cambia estado. Body: `{ estado }`. |
| DELETE | `/citas/:id` | Cancela la cita. |

## Historias clínicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/historias/paciente/:pacienteId` | Historia + evoluciones. |
| POST | `/historias` | Crea/actualiza historia principal. |
| POST | `/historias/evoluciones` | Registra una evolución (append-only). |
| GET | `/historias/evoluciones/:pacienteId` | Lista evoluciones. |

## Odontograma

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/odontograma/:pacienteId` | Estado de todas las piezas. |
| POST | `/odontograma` | Guarda/actualiza un diente (upsert). |
| PUT | `/odontograma/:id` | Actualiza un registro. |

## Planes de tratamiento

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/planes?paciente_id=` | Lista de planes. |
| GET | `/planes/:id` | Plan + detalles + saldo. |
| POST | `/planes` | Crea plan. |
| PUT | `/planes/:id` | Actualiza (recalcula totales). |
| POST | `/planes/:id/detalles` | Agrega procedimiento. |
| PUT | `/planes/detalles/:id` | Actualiza procedimiento. |
| DELETE | `/planes/detalles/:id` | Elimina procedimiento. |

## Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pagos?desde=&hasta=` | Lista de pagos. |
| POST | `/pagos` | Registra pago/abono. |
| GET | `/pagos/paciente/:pacienteId` | Pagos de un paciente. |
| GET | `/pagos/saldo/:pacienteId` | Total tratamientos, abonado y saldo. |

## Inventario

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/inventario?categoria=&buscar=` | Lista de insumos. |
| GET | `/inventario/:id` | Detalle + últimos movimientos. |
| POST/PUT/DELETE | `/inventario/:id` | CRUD. |
| POST | `/inventario/movimientos` | Entrada/salida (transacción, valida stock). |
| GET | `/inventario/alertas/stock-bajo` | Stock bajo, vencidos y por vencer. |
| GET | `/inventario/proveedores/all` | Lista de proveedores. |

## Contenido web

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/contenido/galeria?publico=1` | 🌐 Galería (con `publico=1` solo visibles). |
| POST/DELETE | `/contenido/galeria` | Gestión (ADMIN). |
| GET | `/contenido/testimonios?publico=1` | 🌐 Testimonios. |
| POST/DELETE | `/contenido/testimonios` | Gestión (ADMIN). |
| GET | `/contenido/faqs?publico=1` | 🌐 Preguntas frecuentes. |
| POST/DELETE | `/contenido/faqs` | Gestión (ADMIN). |
| GET | `/contenido/configuracion` | 🌐 Configuración de la clínica. |
| PUT | `/contenido/configuracion` | Actualiza configuración (ADMIN). |

## Dashboard / Reportes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/resumen` | Métricas y agenda del día. |
| GET | `/dashboard/reportes?desde=&hasta=` | Reportes (ADMIN, CAJA). |
| GET | `/dashboard/seguimiento` | Seguimiento de pacientes. |

---

## Pruebas en Postman

1. **Login:** `POST /api/auth/login` con
   ```json
   { "correo": "admin@odontoadmin.com", "password": "Admin123*" }
   ```
   Copia el `token` de la respuesta.

2. **Autorización:** en las demás peticiones agrega el header
   `Authorization: Bearer <token>`. En Postman puedes guardarlo como variable de entorno `{{token}}`.

3. **Flujo sugerido:**
   - Crear paciente → `POST /api/pacientes`
   - Crear cita → `POST /api/citas`
   - Crear plan → `POST /api/planes` y agregar detalles
   - Registrar pago → `POST /api/pagos`
   - Consultar saldo → `GET /api/pagos/saldo/:pacienteId`
   - Ver dashboard → `GET /api/dashboard/resumen`

4. **Probar lo público (sin token):**
   - `GET /api/servicios/publicos`
   - `POST /api/citas/solicitud`
