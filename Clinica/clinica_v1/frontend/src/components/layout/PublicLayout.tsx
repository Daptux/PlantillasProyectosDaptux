import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import WhatsAppButton from "@/components/landing/WhatsAppButton";

/** Layout publico para la landing y paginas abiertas. */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Clinica Salud Vital. Todos los derechos reservados.
      </footer>
      <WhatsAppButton />
    </div>
  );
}
