import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { RoleCode } from "@/types";

/** Protege rutas segun el rol del usuario autenticado. */
export default function RoleRoute({ allow }: { allow: RoleCode[] }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
