/**
 * frontend/src/routes/AppRoutes.jsx
 * Definición central de rutas públicas y protegidas.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Públicas
import Home from '../pages/public/Home';
import Servicios from '../pages/public/Servicios';
import ServicioDetalle from '../pages/public/ServicioDetalle';
import Equipo from '../pages/public/Equipo';
import Galeria from '../pages/public/Galeria';
import Blog from '../pages/public/Blog';
import Contacto from '../pages/public/Contacto';
import ReservarCita from '../pages/public/ReservarCita';
import Login from '../pages/auth/Login';

// Admin
import Dashboard from '../pages/admin/Dashboard';
import Citas from '../pages/admin/Citas';
import Pacientes from '../pages/admin/Pacientes';
import PacienteDetalle from '../pages/admin/PacienteDetalle';
import Odontologos from '../pages/admin/Odontologos';
import ServiciosAdmin from '../pages/admin/ServiciosAdmin';
import HistoriasClinicas from '../pages/admin/HistoriasClinicas';
import Odontograma from '../pages/admin/Odontograma';
import PlanesTratamiento from '../pages/admin/PlanesTratamiento';
import Pagos from '../pages/admin/Pagos';
import Inventario from '../pages/admin/Inventario';
import ContenidoWeb from '../pages/admin/ContenidoWeb';
import Reportes from '../pages/admin/Reportes';
import Usuarios from '../pages/admin/Usuarios';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas con layout público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/:id" element={<ServicioDetalle />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/reservar-cita" element={<ReservarCita />} />
      </Route>

      {/* Login (sin layout) */}
      <Route path="/login" element={<Login />} />

      {/* Admin protegido */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="citas" element={<Citas />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/:id" element={<PacienteDetalle />} />
          <Route path="odontologos" element={<Odontologos />} />
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="historias" element={<HistoriasClinicas />} />
          <Route path="odontograma/:pacienteId" element={<Odontograma />} />
          <Route path="planes-tratamiento" element={<PlanesTratamiento />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="contenido-web" element={<ContenidoWeb />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
