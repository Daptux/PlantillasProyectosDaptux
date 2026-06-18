import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import LandingPage from "@/pages/public/LandingPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AppointmentsPage from "@/pages/admin/AppointmentsPage";
import PatientsPage from "@/pages/admin/PatientsPage";
import DoctorsPage from "@/pages/admin/DoctorsPage";
import ServicesPage from "@/pages/admin/ServicesPage";
import CatalogsPage from "@/pages/admin/CatalogsPage";
import ResultsPage from "@/pages/admin/ResultsPage";
import PaymentsPage from "@/pages/admin/PaymentsPage";
import PqrsfPage from "@/pages/admin/PqrsfPage";
import UsersPage from "@/pages/admin/UsersPage";
import LandingEditorPage from "@/pages/admin/LandingEditorPage";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import DoctorAgendaPage from "@/pages/doctor/DoctorAgendaPage";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import PatientAppointmentsPage from "@/pages/patient/PatientAppointmentsPage";
import PatientDocumentsPage from "@/pages/patient/PatientDocumentsPage";
import PatientResultsPage from "@/pages/patient/PatientResultsPage";
import PatientPaymentsPage from "@/pages/patient/PatientPaymentsPage";
import PatientPqrsfPage from "@/pages/patient/PatientPqrsfPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Publico */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth (sin layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Privado (requiere sesion) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Admin y staff */}
          <Route
            element={<RoleRoute allow={["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION", "LABORATORIO", "FACTURACION"]} />}
          >
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Citas, pacientes y PQRSF (gestion staff: admin/recepcion) */}
          <Route element={<RoleRoute allow={["SUPER_ADMIN", "ADMIN_CLINICA", "RECEPCION"]} />}>
            <Route path="/admin/citas" element={<AppointmentsPage />} />
            <Route path="/admin/pacientes" element={<PatientsPage />} />
            <Route path="/admin/pqrsf" element={<PqrsfPage />} />
          </Route>

          {/* Configuracion (solo administracion) */}
          <Route element={<RoleRoute allow={["SUPER_ADMIN", "ADMIN_CLINICA"]} />}>
            <Route path="/admin/medicos" element={<DoctorsPage />} />
            <Route path="/admin/servicios" element={<ServicesPage />} />
            <Route path="/admin/catalogos" element={<CatalogsPage />} />
            <Route path="/admin/usuarios" element={<UsersPage />} />
            <Route path="/admin/landing" element={<LandingEditorPage />} />
          </Route>

          {/* Resultados (administracion y laboratorio) */}
          <Route element={<RoleRoute allow={["SUPER_ADMIN", "ADMIN_CLINICA", "LABORATORIO"]} />}>
            <Route path="/admin/resultados" element={<ResultsPage />} />
          </Route>

          {/* Pagos (administracion y facturacion) */}
          <Route element={<RoleRoute allow={["SUPER_ADMIN", "ADMIN_CLINICA", "FACTURACION"]} />}>
            <Route path="/admin/pagos" element={<PaymentsPage />} />
          </Route>

          {/* Medico */}
          <Route element={<RoleRoute allow={["MEDICO"]} />}>
            <Route path="/medico" element={<DoctorDashboard />} />
            <Route path="/medico/agenda" element={<DoctorAgendaPage />} />
          </Route>

          {/* Paciente */}
          <Route element={<RoleRoute allow={["PACIENTE"]} />}>
            <Route path="/paciente" element={<PatientDashboard />} />
            <Route path="/paciente/citas" element={<PatientAppointmentsPage />} />
            <Route path="/paciente/documentos" element={<PatientDocumentsPage />} />
            <Route path="/paciente/resultados" element={<PatientResultsPage />} />
            <Route path="/paciente/pagos" element={<PatientPaymentsPage />} />
            <Route path="/paciente/pqrsf" element={<PatientPqrsfPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
