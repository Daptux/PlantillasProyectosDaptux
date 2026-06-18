import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/pqrsf.controller";

const router = Router();

// POST publico: la landing permite enviar PQRSF sin autenticacion.
// Con auth opcional: si el paciente esta logueado, se vincula su ficha.
router.post("/", optionalAuthenticate, ctrl.create);

// A partir de aqui, todo requiere autenticacion.
router.use(authenticate);

// El paciente ve sus propias PQRSF (antes de "/:id").
router.get("/mine", ctrl.mine);

// Gestion: administracion y recepcion.
const gestion = authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA, ROLES.RECEPCION);
router.get("/", gestion, ctrl.list);
router.get("/:id", gestion, ctrl.getById);
router.put("/:id/respond", gestion, ctrl.respond);
router.put("/:id/status", gestion, ctrl.updateStatus);

export default router;
