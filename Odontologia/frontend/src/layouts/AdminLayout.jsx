// frontend/src/layouts/AdminLayout.jsx
// Estructura del panel: sidebar + topbar + contenido.

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
