/**
 * frontend/src/components/landing/WhatsappFab.jsx
 * Botón flotante de WhatsApp.
 */
export default function WhatsappFab({ config }) {
  const whatsapp = (config?.whatsapp || '').replace(/[^\d]/g, '');
  if (!whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 grid place-items-center rounded-full bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600 hover:scale-105 transition"
      aria-label="Escríbenos por WhatsApp"
    >
      💬
    </a>
  );
}
