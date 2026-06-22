import { IoLogoWhatsapp } from 'react-icons/io5';
import { useStore } from '../../context/StoreContext.jsx';

export default function WhatsAppButton() {
  const { settings } = useStore();
  const numero = settings?.whatsapp;
  if (!numero) return null;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent('¡Hola! Quiero más información sobre sus productos 🛍️')}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110"
      title="Escríbenos por WhatsApp"
    >
      <IoLogoWhatsapp size={30} />
    </a>
  );
}
