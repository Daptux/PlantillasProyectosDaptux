import api from '../api/axios';

export const registrarPago = (datos) => api.post('/pagos', datos).then((r) => r.data);
export const listarPagos = () => api.get('/pagos').then((r) => r.data);
export const pagosPorReserva = (idReserva) =>
  api.get(`/pagos/reserva/${idReserva}`).then((r) => r.data);

// ----- Pasarela Wompi -----
// Crea el intento de pago y devuelve los datos firmados para el widget.
export const iniciarCheckout = (datos) =>
  api.post('/pagos/checkout', datos).then((r) => r.data);
// Confirma el pago tras cerrar el widget (verifica contra la API de Wompi).
export const confirmarPagoWompi = (transaccion_id) =>
  api.post('/pagos/confirmar', { transaccion_id }).then((r) => r.data);
// Consulta el estado de un intento de pago por su referencia.
export const estadoIntento = (referencia) =>
  api.get(`/pagos/estado/${referencia}`).then((r) => r.data);
