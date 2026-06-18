import { Router } from "express";
import * as ctrl from "../controllers/public.controller";

// Rutas publicas (sin authenticate). Solo lectura de datos no sensibles.
const router = Router();

router.get("/specialties", ctrl.specialties);
router.get("/doctors", ctrl.doctors);

export default router;
