import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rutas publicas
router.post("/login", authController.login);
router.post("/register-patient", authController.registerPatient);

// Ruta protegida
router.get("/me", authenticate, authController.me);

export default router;
