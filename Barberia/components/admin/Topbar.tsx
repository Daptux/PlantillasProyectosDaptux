"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ROL_LABEL: Record<string, string> = {
  superadmin: "Dueño", admin: "Administrador",
  barbero: "Barbero", recepcionista: "Recepcionista", cliente: "Cliente",
};

export function Topbar({
  nombre,
  rol,
  onMenu,
}: {
  nombre: string;
  rol: string | null;
  onMenu: () => void;
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <button className="lg:hidden" onClick={onMenu}><Menu className="h-6 w-6" /></button>
      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
              {initials(nombre)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-none">{nombre}</span>
              <span className="block text-xs text-muted-foreground">{rol ? ROL_LABEL[rol] ?? rol : ""}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{nombre}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/configuracion")}>
            <User className="h-4 w-4" /> Configuración
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
