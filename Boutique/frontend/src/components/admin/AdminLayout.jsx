import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
