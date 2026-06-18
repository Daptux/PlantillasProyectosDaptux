import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import ClientLayout from '../layouts/ClientLayout';

import Landing from '../pages/Landing';
import RoomDetail from '../pages/RoomDetail';
import OpinionesPublicas from '../pages/OpinionesPublicas';
import ReservaConfirmada from '../pages/ReservaConfirmada';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Empleados from '../pages/Empleados';
import Clientes from '../pages/Clientes';
import Habitaciones from '../pages/Habitaciones';
import Reservas from '../pages/Reservas';
import Pagos from '../pages/Pagos';
import MisReservas from '../pages/MisReservas';
import Opiniones from '../pages/Opiniones';
import Perfil from '../pages/Perfil';
import NoAutorizado from '../pages/NoAutorizado';

// Elige el layout según el rol: panel (sidebar) para staff, sitio web para clientes.
function RoleLayout() {
  const { usuario } = useAuth();
  return usuario.rol === 'CLIENTE' ? <ClientLayout /> : <MainLayout />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/habitacion/:id" element={<RoomDetail />} />
      <Route path="/resenas" element={<OpinionesPublicas />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* Confirmación de reserva (cliente autenticado, pantalla completa) */}
      <Route
        path="/reserva-confirmada"
        element={
          <ProtectedRoute roles={['CLIENTE']}>
            <ReservaConfirmada />
          </ProtectedRoute>
        }
      />

      {/* Privadas (layout según rol) */}
      <Route
        element={
          <ProtectedRoute>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        {/* ADMIN / EMPLEADO */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ADMIN', 'EMPLEADO']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleados"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Empleados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute roles={['ADMIN', 'EMPLEADO']}>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habitaciones"
          element={
            <ProtectedRoute roles={['ADMIN', 'EMPLEADO']}>
              <Habitaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute roles={['ADMIN', 'EMPLEADO']}>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pagos"
          element={
            <ProtectedRoute roles={['ADMIN', 'EMPLEADO']}>
              <Pagos />
            </ProtectedRoute>
          }
        />

        {/* CLIENTE */}
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <MisReservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opiniones"
          element={
            <ProtectedRoute roles={['CLIENTE']}>
              <Opiniones />
            </ProtectedRoute>
          }
        />

        {/* Todos los roles autenticados */}
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      {/* Cualquier otra ruta -> página pública */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
