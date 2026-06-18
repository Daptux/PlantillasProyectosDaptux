import { MessageCircle } from "lucide-react";

/** Boton flotante de WhatsApp visible en toda la app publica. */
export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER ?? "573000000000";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    "Hola, quiero mas informacion sobre la clinica."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
