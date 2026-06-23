import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from 'react-icons/io5';
import { paymentService } from '../../services/payment.service.js';
import { orderService } from '../../services/order.service.js';
import { formatPrice } from '../../utils/format.js';
import Loader from '../../components/common/Loader.jsx';

// Wompi redirige aquí: /pago/resultado?order=<id>&id=<transactionId>&env=test
export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const transactionId = params.get('id');

  const [estado, setEstado] = useState('cargando'); // cargando | aprobado | pendiente | rechazado | error
  const [order, setOrder] = useState(null);
  const intentos = useRef(0);

  useEffect(() => {
    let cancelado = false;

    async function chequear() {
      try {
        if (transactionId) {
          // Verifica contra Wompi y actualiza el pedido
          const res = await paymentService.verifyWompi(transactionId);
          if (cancelado) return;
          setOrder(res.order);
          const s = res.wompi_status;
          if (s === 'APPROVED') return setEstado('aprobado');
          if (s === 'DECLINED' || s === 'ERROR' || s === 'VOIDED') return setEstado('rechazado');
          // PENDING -> reintentar unas veces (Nequi/PSE pueden tardar)
          if (intentos.current < 6) {
            intentos.current += 1;
            setTimeout(chequear, 3000);
            return setEstado('pendiente');
          }
          return setEstado('pendiente');
        }

        // Sin transactionId: el usuario no completó el pago. Mostramos el pedido.
        if (orderId) {
          const o = await orderService.get(orderId);
          if (cancelado) return;
          setOrder(o);
          setEstado(o.estado_pago === 'PAGADO' ? 'aprobado' : 'pendiente');
          return;
        }
        setEstado('error');
      } catch (_) {
        if (!cancelado) setEstado('error');
      }
    }

    chequear();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (estado === 'cargando') return <Loader fullScreen label="Verificando tu pago..." />;

  const VIEWS = {
    aprobado: {
      Icon: IoCheckmarkCircle, color: 'text-emerald-500',
      title: '¡Pago aprobado!',
      msg: 'Tu pago fue confirmado y tu pedido está en preparación. ¡Gracias por tu compra!',
    },
    pendiente: {
      Icon: IoTimeOutline, color: 'text-amber-500',
      title: 'Pago en proceso',
      msg: 'Tu pago está siendo procesado. Te avisaremos cuando se confirme. Puedes ver el estado en "Mis pedidos".',
    },
    rechazado: {
      Icon: IoCloseCircle, color: 'text-red-500',
      title: 'Pago rechazado',
      msg: 'No se pudo procesar el pago. Tu pedido quedó pendiente; puedes reintentar el pago desde "Mis pedidos".',
    },
    error: {
      Icon: IoCloseCircle, color: 'text-neutral-400',
      title: 'No pudimos verificar el pago',
      msg: 'Revisa el estado de tu pedido en "Mis pedidos". Si el cobro se realizó, se reflejará allí.',
    },
  };
  const v = VIEWS[estado] || VIEWS.error;
  const Icon = v.Icon;

  return (
    <div className="container-max flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Icon size={80} className={v.color} />
      <h1 className="mt-4 font-display text-3xl font-bold">{v.title}</h1>
      {order && (
        <p className="mt-2 text-neutral-600">
          Pedido <strong>{order.numero}</strong> · {formatPrice(order.total)}
        </p>
      )}
      <p className="mt-3 max-w-md text-sm text-neutral-500">{v.msg}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order && <Link to={`/mis-pedidos/${order.id}`} className="btn-primary">Ver mi pedido</Link>}
        <Link to="/mis-pedidos" className="btn-outline">Mis pedidos</Link>
        <Link to="/tienda" className="btn-ghost">Seguir comprando</Link>
      </div>
    </div>
  );
}
