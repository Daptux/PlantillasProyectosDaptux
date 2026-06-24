import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline, IoCardOutline } from 'react-icons/io5';
import { paymentService, goToWompiCheckout } from '../../services/payment.service.js';
import { orderService } from '../../services/order.service.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';

// /pago/resultado?order=<id>           -> abre Wompi (pago pendiente)
// /pago/resultado?order=<id>&id=<txId> -> verifica el resultado tras pagar
export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const transactionId = params.get('id');

  // cargando | iniciando | aprobado | pendiente | rechazado | error
  const [estado, setEstado] = useState('cargando');
  const [order, setOrder] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const intentos = useRef(0);

  // Redirige a la pasarela de Wompi para un pedido pendiente
  async function abrirWompi(ord) {
    setEstado('iniciando');
    setErrMsg('');
    try {
      await goToWompiCheckout(ord.id); // redirige el navegador al link de pago
    } catch (e) {
      setErrMsg(e.response?.data?.message || e.message || 'No se pudo abrir la pasarela');
      setEstado('error');
    }
  }

  useEffect(() => {
    let cancelado = false;

    async function verificar() {
      try {
        const res = await paymentService.verifyWompi(transactionId, orderId);
        if (cancelado) return;
        setOrder(res.order);
        const s = res.wompi_status;
        if (s === 'APPROVED') return setEstado('aprobado');
        if (['DECLINED', 'ERROR', 'VOIDED'].includes(s)) return setEstado('rechazado');
        // PENDING (Nequi/PSE pueden tardar) -> reintenta unas veces
        if (intentos.current < 6) { intentos.current += 1; setTimeout(verificar, 3000); }
        return setEstado('pendiente');
      } catch (_) {
        if (!cancelado) setEstado('error');
      }
    }

    async function init() {
      if (!orderId) { setEstado('error'); return; }
      try {
        const ord = await orderService.get(orderId);
        if (cancelado) return;
        setOrder(ord);

        // Si venimos de Wompi con transacción -> verificar
        if (transactionId) return verificar();

        // Estados ya resueltos
        if (ord.estado_pago === 'PAGADO') return setEstado('aprobado');
        if (ord.estado === 'CANCELADO') return setEstado('rechazado');

        // Contra entrega -> solo informativo
        if (ord.metodo_pago === 'CONTRA_ENTREGA') return setEstado('pendiente');

        // Pago en línea pendiente -> abrir Wompi
        return abrirWompi(ord);
      } catch (_) {
        if (!cancelado) setEstado('error');
      }
    }

    init();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (estado === 'cargando') return <Loader fullScreen label="Cargando..." />;
  if (estado === 'iniciando') return <Loader fullScreen label="Abriendo la pasarela de pago..." />;

  const VIEWS = {
    aprobado: { Icon: IoCheckmarkCircle, color: 'text-emerald-500', title: '¡Pago aprobado!',
      msg: 'Tu pago fue confirmado y tu pedido está en preparación. ¡Gracias por tu compra!' },
    pendiente: { Icon: IoTimeOutline, color: 'text-amber-500', title: 'Pago pendiente',
      msg: order?.metodo_pago === 'CONTRA_ENTREGA'
        ? 'Tu pedido fue creado. Pagarás contra entrega; te contactaremos para coordinar el envío.'
        : 'Tu pago está en proceso. Te avisaremos cuando se confirme.' },
    rechazado: { Icon: IoCloseCircle, color: 'text-red-500', title: 'Pago no completado',
      msg: 'El pago no se realizó. Tu pedido quedó pendiente; puedes intentar pagar de nuevo.' },
    error: { Icon: IoCloseCircle, color: 'text-neutral-400', title: 'Hubo un problema',
      msg: 'No pudimos procesar el pago en este momento.' },
  };
  const v = VIEWS[estado] || VIEWS.error;
  const Icon = v.Icon;
  const puedePagar = order && order.estado_pago !== 'PAGADO' && order.estado !== 'CANCELADO' && order.metodo_pago !== 'CONTRA_ENTREGA';

  return (
    <div className="container-max flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Icon size={80} className={v.color} />
      <h1 className="mt-4 font-display text-3xl font-bold">{v.title}</h1>
      {order && <p className="mt-2 text-neutral-600">Pedido <strong>{order.numero}</strong> · {formatPrice(order.total)}</p>}
      <p className="mt-3 max-w-md text-sm text-neutral-500">{v.msg}</p>

      {errMsg && <Alert type="error" className="mt-4 max-w-md text-left">{errMsg}</Alert>}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {puedePagar && (estado === 'rechazado' || estado === 'error') && (
          <Button variant="primary" onClick={() => abrirWompi(order)}>
            <IoCardOutline size={18} /> Intentar pagar de nuevo
          </Button>
        )}
        {order && <Link to={`/mis-pedidos/${order.id}`} className="btn-outline">Ver mi pedido</Link>}
        <Link to="/mis-pedidos" className="btn-ghost">Mis pedidos</Link>
        <Link to="/tienda" className="btn-ghost">Seguir comprando</Link>
      </div>
    </div>
  );
}
