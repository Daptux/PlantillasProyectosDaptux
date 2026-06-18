import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as ctrl from "../controllers/dashboard.controller";

const router = Router();

router.use(authenticate);
router.get("/summary", ctrl.summary);

export default router;
