/**
 * frontend/src/layouts/PublicLayout.jsx
 * Layout de la web pública: navbar fijo, contenido y footer.
 */
import { Outlet, useOutletContext } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import WhatsappFab from '../components/landing/WhatsappFab';
import { useConfig } from '../hooks/useConfig';

export default function PublicLayout() {
  const { config } = useConfig();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar config={config} />
      <main className="flex-1 pt-16">
        <Outlet context={{ config }} />
      </main>
      <Footer config={config} />
      <WhatsappFab config={config} />
    </div>
  );
}

// Helper para que las páginas accedan a la config desde el layout
export function useLandingConfig() {
  return useOutletContext();
}
