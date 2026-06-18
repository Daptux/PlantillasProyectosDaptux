import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/landing.controller";

const router = Router();

// GET publico: la landing lee su contenido sin autenticacion.
router.get("/", ctrl.get);

// PUT protegido: solo admin edita el contenido de la landing.
router.put("/", authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA), ctrl.update);

export default router;
