import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize, ROLES } from "../middlewares/role.middleware";
import * as ctrl from "../controllers/clinics.controller";

const router = Router();

// El service aplica el control fino (SUPER_ADMIN todas; ADMIN_CLINICA la suya).
router.use(authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN_CLINICA));

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
