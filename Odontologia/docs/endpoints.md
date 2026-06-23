# Endpoints del API — OdontoAdmin Pro

Base URL: `http://localhost:4000/api`

Todas las respuestas siguen el formato:
```json
{ "ok": true, "datos": ... }       // éxito
{ "ok": false, "mensaje": "..." }  // error
```

Las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

## Públicos (sin token)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del API |
| POST | `/auth/login` | Iniciar sesión → devuelve token |
| GET | `/servicios/publicos` | Servicios visibles en landing |
| GET | `/odontologos/publicos` | Equipo visible en landing |
| GET | `/contenido/galeria` | Galería visible |
| GET | `/contenido/testimonios` | Testimonios visibles |
| GET | `/contenido/faqs` | Preguntas frecuentes |
| GET | `/contenido/configuracion` | Configuración de la clínica |
| POST | `/citas/publica` | Reserva desde la landing (estado SOLICITADA) |

## Auth
| Método | Ruta | Roles |
|--------|------|-------|
| POST | `/auth/login` | público |
| GET | `/auth/profile` | autenticado |

## Usuarios *(ADMIN)*
`GET /usuarios` · `POST /usuarios` · `GET /usuarios/:id` · `PUT /usuarios/:id` · `DELETE /usuarios/:id`

## Pacientes
`GET /pacientes?buscar=` · `POST /pacientes` · `GET /pacientes/:id` · `PUT /pacientes/:id` · `DELETE /pacientes/:id`

## Odontólogos
`GET /odontologos` · `POST /odontologos` · `GET /odontologos/:id` · `PUT /odontologos/:id` · `DELETE /odontologos/:id`

## Servicios
`GET /servicios` · `POST /servicios` · `GET /servicios/:id` · `PUT /servicios/:id` · `DELETE /servicios/:id`

## Citas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/citas?fecha=&estado=&odontologo_id=&paciente_id=` | Listar/filtrar |
| POST | `/citas` | Crear (interno) |
| GET | `/citas/:id` | Detalle |
| PUT | `/citas/:id` | Actualizar |
| PATCH | `/citas/:id/estado` | Cambiar estado `{ "estado": "CONFIRMADA" }` |
| DELETE | `/citas/:id` | Cancelar (soft) |

## Historias clínicas
| Método | Ruta |
|--------|------|
| GET | `/historias/paciente/:pacienteId` |
| POST | `/historias` |
| POST | `/historias/evoluciones` |
| GET | `/historias/evoluciones/:pacienteId` |

## Odontograma
`GET /odontograma/:pacienteId` · `POST /odontograma` · `PUT /odontograma/:id`

## Planes de tratamiento
`GET /planes?paciente_id=&estado=` · `POST /planes` · `GET /planes/:id` · `PUT /planes/:id`
`POST /planes/:id/detalles` · `PUT /planes/detalles/:id`

## Pagos
`GET /pagos?paciente_id=&desde=&hasta=` · `POST /pagos`
`GET /pagos/paciente/:pacienteId` · `GET /pagos/saldo/:pacienteId`

## Inventario
`GET /inventario?categoria=&buscar=` · `POST /inventario` · `GET /inventario/:id` · `PUT /inventario/:id` · `DELETE /inventario/:id`
`POST /inventario/movimientos` · `GET /inventario/alertas/stock-bajo`

## Contenido web *(edición: ADMIN)*
`GET/POST /contenido/galeria` · `DELETE /contenido/galeria/:id`
`GET/POST /contenido/testimonios` · `DELETE /contenido/testimonios/:id`
`GET/POST /contenido/faqs` · `DELETE /contenido/faqs/:id`
`GET/PUT /contenido/configuracion`

## Dashboard
`GET /dashboard/resumen`

---

## Probar en Postman
1. **Login:** `POST /api/auth/login` con body JSON:
   ```json
   { "correo": "admin@odontoadmin.com", "password": "Admin123*" }
   ```
2. Copia el `token` de la respuesta.
3. En Postman, pestaña **Authorization → Bearer Token**, pega el token (o crea una
   variable de entorno `{{token}}` y úsala en el header).
4. Llama a cualquier endpoint protegido, por ejemplo `GET /api/dashboard/resumen`.

> Sugerencia: crea una variable de colección `baseUrl = http://localhost:4000/api`
> y un script en *Tests* del login para guardar el token automáticamente:
> ```js
> pm.environment.set("token", pm.response.json().token);
> ```
