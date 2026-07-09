"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export function AdminShell({
  children,
  nombreBarberia,
  nombreUsuario,
  rol,
}: {
  children: React.ReactNode;
  nombreBarberia: string;
  nombreUsuario: string;
  rol: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar rol={rol} nombre={nombreBarberia} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar nombre={nombreUsuario} rol={rol} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
