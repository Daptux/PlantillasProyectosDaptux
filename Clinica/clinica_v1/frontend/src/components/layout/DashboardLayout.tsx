import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";

/** Layout privado con sidebar y barra superior para los paneles internos. */
export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b bg-card/80 px-6 backdrop-blur">
          <NotificationBell />
          <div className="text-sm">
            <span className="font-medium">{user?.nombres} {user?.apellidos}</span>
            <span className="ml-2 text-xs text-muted-foreground">{user?.rol}</span>
          </div>
        </header>
        <div className="container py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
