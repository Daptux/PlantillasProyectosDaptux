import { redirect } from "next/navigation";

// La raiz redirige al login. El middleware se encarga de mandar al dashboard
// si ya existe una sesion activa.
export default function RootPage() {
  redirect("/login");
}
