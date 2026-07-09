# Endpoints — BarberPro Studio

Todos bajo `app/api`. Respuesta estándar: `{ success, message?, data?, error? }`.
Los endpoints protegidos validan permiso vía `requirePermiso` (ver `lib/permissions.ts`).

## Auth
| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/api/auth/login` | Iniciar sesión | público |
| POST | `/api/auth/logout` | Cerrar sesión | sesión |
| GET | `/api/auth/me` | Usuario actual + rol | sesión |

## Dashboard
| GET | `/api/dashboard/resumen` | KPIs, gráfica, próximas citas, stock bajo | `dashboard.ver` |

## Servicios / Barberos / Clientes / Promociones / Galería / Testimonios / Productos
CRUD homogéneo (factory `lib/crud.ts`):
| GET | `/api/<recurso>` | Listar | ver/gestionar |
| POST | `/api/<recurso>` | Crear | gestionar |
| GET/PUT/DELETE | `/api/<recurso>/[id]` | Detalle / editar / eliminar (soft) | gestionar |

Recursos: `servicios`, `barberos`, `clientes`, `promociones`, `galeria`,
`testimonios`, `inventario/productos`.

## Reservas
| GET | `/api/reservas` | Listar (filtros: fecha, estado, barbero_id, cliente_id) | `reservas.ver` |
| POST | `/api/reservas` | Crear desde la web pública | público |
| GET/PUT/DELETE | `/api/reservas/[id]` | Detalle / editar / cancelar | `reservas.*` |
| PATCH | `/api/reservas/[id]/estado` | Cambiar estado | `reservas.editar` |

## Disponibilidad
| GET | `/api/disponibilidad?servicio_id=&barbero_id=&fecha=` | Horarios disponibles | público |

## Finanzas / Caja
| GET | `/api/finanzas/resumen` | Ingresos, gastos, utilidad, por método/categoría | `finanzas.ver` |
| GET/POST | `/api/finanzas/movimientos` | Listar / registrar movimiento | `finanzas.*` |
| POST | `/api/caja/abrir` · `/api/caja/cerrar` | Apertura / cierre | `caja.gestionar` |
| GET | `/api/caja/actual` | Caja abierta + balance | `caja.gestionar` |

## Inventario / Ventas
| GET/POST | `/api/inventario/movimientos` | Historial / entrada-salida-ajuste | `inventario.gestionar` |
| GET | `/api/inventario/stock-bajo` | Productos bajo mínimo | `inventario.gestionar` |
| GET/POST | `/api/ventas` | Historial / registrar venta (descuenta stock + ingreso) | `ventas.gestionar` |

## Configuración / Usuarios / Roles / Reportes / Leads
| GET/PUT | `/api/configuracion` | Leer / actualizar marca y reglas | `configuracion.gestionar` (PUT) |
| GET/POST | `/api/usuarios` | Listar / crear (Supabase Auth) | `usuarios.gestionar` |
| GET | `/api/roles` | Roles de la barbería | `usuarios.gestionar` |
| GET | `/api/reportes?desde=&hasta=` | Reporte consolidado | `reportes.ver` |
| POST | `/api/leads` | Guardar lead de contacto | público |
