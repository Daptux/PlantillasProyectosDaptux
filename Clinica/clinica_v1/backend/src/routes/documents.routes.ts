import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import { upload } from "../middlewares/upload.middleware";
import * as ctrl from "../controllers/documents.controller";

const router = Router();

router.use(authenticate);

// Subir documento: paciente (el suyo), recepcion, medico y administracion.
router.post(
  "/upload",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.MEDICO, ROLES.PACIENTE),
  upload.single("archivo"),
  ctrl.upload
);

// Documentos del paciente autenticado (antes de las rutas con parametro).
router.get("/mine", ctrl.mine);

// Listar documentos de un paciente (el service valida propiedad si es PACIENTE).
router.get("/patient/:patientId", ctrl.listByPatient);

// Descarga segura (valida permisos antes de enviar el archivo).
router.get("/:id/download", ctrl.download);

// Eliminar documento: administracion/recepcion o el propio paciente.
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION, ROLES.PACIENTE),
  ctrl.remove
);

export default router;
