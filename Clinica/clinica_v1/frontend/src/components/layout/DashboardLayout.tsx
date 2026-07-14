import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, HeartPulse } from "lucide-react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";

/** Layout privado con sidebar y barra superior para los paneles internos. */
export default function DashboardLayout() {
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur sm:px-6">
          {/* Hamburguesa: solo movil */}
          <button
            onClick={() => setNavOpen(true)}
            className="-ml-1 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Marca en movil (el sidebar esta oculto) */}
          <div className="flex items-center gap-2 font-extrabold text-primary lg:hidden">
            <HeartPulse className="h-5 w-5" />
            <span className="text-sm">Salud Vital</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">
                {user?.nombres} {user?.apellidos}
              </div>
              <div className="text-xs text-muted-foreground">{user?.rol}</div>
            </div>
          </div>
        </header>

        <div className="container py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
