import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Navbar publico para la landing. */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-primary">
          <img src="/logo.svg" alt="Logo" className="h-9 w-9" />
          <span className="text-lg">Salud Vital</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#servicios" className="hover:text-primary">Servicios</a>
          <a href="#especialidades" className="hover:text-primary">Especialidades</a>
          <a href="#sedes" className="hover:text-primary">Sedes</a>
          <a href="#contacto" className="hover:text-primary">Contacto</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Iniciar sesion</Button>
          </Link>
          <Link to="/registro">
            <Button size="sm">Registrarse</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
