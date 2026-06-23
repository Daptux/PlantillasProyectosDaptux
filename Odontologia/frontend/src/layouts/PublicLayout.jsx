// frontend/src/layouts/PublicLayout.jsx
// Estructura común de las páginas públicas: navbar + contenido + footer + WhatsApp.

import { Outlet } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
