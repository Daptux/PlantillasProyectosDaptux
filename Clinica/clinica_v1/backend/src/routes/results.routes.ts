import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import { upload } from "../middlewares/upload.middleware";
import * as ctrl from "../controllers/results.controller";

const router = Router();

router.use(authenticate);

// Listado general: staff clinico (no paciente; el paciente usa /patient/:id).
router.get(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.LABORATORIO, ROLES.MEDICO),
  ctrl.list
);

// Cargar resultado: laboratorio, medico y administracion.
router.post(
  "/upload",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.LABORATORIO, ROLES.MEDICO),
  upload.single("archivo"),
  ctrl.upload
);

// Resultados del paciente autenticado.
router.get("/mine", ctrl.mine);

// Resultados de un paciente (el service valida propiedad si es PACIENTE).
router.get("/patient/:patientId", ctrl.listByPatient);

// Descarga segura.
router.get("/:id/download", ctrl.download);

// Eliminar: NO recepcion (regla de negocio). Laboratorio/medico/administracion.
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.LABORATORIO, ROLES.MEDICO),
  ctrl.remove
);

export default router;
