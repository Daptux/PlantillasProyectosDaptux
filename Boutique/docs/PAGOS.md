# 💳 Pagos con Wompi

Integración de la pasarela **Wompi** (Colombia) con el **Web Checkout**. Soporta tarjeta, Nequi, PSE, Bancolombia, etc. en una sola pantalla.

Principio clave: **el pedido NO se aprueba hasta que Wompi confirma el pago.** El pedido se crea en estado `PENDIENTE / PENDIENTE`, y solo cuando llega la aprobación se pasa a `CONFIRMADO / PAGADO` y se **descuenta el inventario**.

---

## Flujo

```
Cliente (logueado)
  │  1. Llena checkout y elige "Pago en línea"
  ▼
POST /api/orders            -> crea pedido PENDIENTE (no descuenta stock)
  ▼
POST /api/payments/wompi/init { order_id }
  │   devuelve: reference (= número de pedido), amount-in-cents,
  │   y la FIRMA DE INTEGRIDAD (SHA256, calculada en el backend)
  ▼
Frontend redirige a  https://checkout.wompi.co/p/?...   (Web Checkout)
  ▼
Cliente paga (tarjeta / Nequi / PSE...)
  ▼
Wompi ──► (A) redirige a /pago/resultado?order=ID&id=TX   [experiencia del usuario]
       └► (B) POST /api/payments/wompi/webhook            [FUENTE DE VERDAD]
  ▼
Backend (en A y en B):
  - APPROVED  -> markOrderPaid()  -> estado=CONFIRMADO, estado_pago=PAGADO, descuenta stock
  - DECLINED  -> markOrderPaymentFailed() -> estado_pago=RECHAZADO
  - PENDING   -> sin cambios (la página reintenta unas veces)
```

- **(A) Verificación tras redirect** (`GET /api/payments/wompi/verify/:txId`): consulta la API de Wompi con la llave privada y actualiza el pedido al instante. Útil porque el webhook puede tardar.
- **(B) Webhook** (`POST /api/payments/wompi/webhook`): Wompi notifica el estado final. Se **verifica la firma** del evento con el `WOMPI_EVENTS_SECRET`. Es la fuente de verdad.

Ambos caminos son **idempotentes**: el stock se descuenta una sola vez (solo si el pedido seguía `PENDIENTE`).

---

## Endpoints

| Método | Ruta | Acceso |
|--------|------|--------|
| `GET` | `/api/payments/config` | público (llave pública) |
| `POST` | `/api/payments/wompi/init` | cliente autenticado |
| `GET` | `/api/payments/wompi/verify/:transactionId` | cliente autenticado |
| `POST` | `/api/payments/wompi/webhook` | público (firma verificada) |

---

## Variables de entorno (backend)

```env
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
WOMPI_EVENTS_SECRET=test_events_xxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxx
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_CHECKOUT_URL=https://checkout.wompi.co/p/
```

> En **producción** cambia las llaves `pub_test_/prv_test_` por las de producción (`pub_prod_/prv_prod_`),
> y `WOMPI_API_URL` a `https://production.wompi.co/v1`.

En **Railway** agrega estas variables al servicio backend (igual que `DB_*`, `JWT_SECRET`, `FRONTEND_URL`).

---

## Configurar el webhook en Wompi

En el panel de Wompi → **Desarrolladores → Eventos**, registra la URL pública de tu backend:

```
https://backend-production-706d.up.railway.app/api/payments/wompi/webhook
```

Wompi firmará cada evento con el `WOMPI_EVENTS_SECRET`. El backend rechaza (401) cualquier evento con firma inválida.

---

## Tarjetas de prueba (sandbox)

| Resultado | Número | Datos |
|-----------|--------|-------|
| Aprobada | `4242 4242 4242 4242` | CVV `123`, fecha futura |
| Rechazada | `4111 1111 1111 1111` | CVV `123`, fecha futura |

Para **Nequi sandbox** usa el número que indique el checkout de pruebas. (Wompi simula la aprobación/declinación.)

---

## Seguridad del flujo

- Crear pedido y pagar **requieren sesión** (`authRequired`). Un invitado ni siquiera tiene carrito (el carrito es por usuario en el servidor).
- La **firma de integridad** se calcula en el backend; el `WOMPI_INTEGRITY_SECRET` nunca llega al navegador.
- La firma del **webhook** se valida antes de tocar la base de datos.
- El cliente solo puede verificar/iniciar el pago de **sus** pedidos.
