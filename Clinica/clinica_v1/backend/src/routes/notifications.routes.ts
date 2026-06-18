import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as ctrl from "../controllers/notifications.controller";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.list);
router.get("/unread-count", ctrl.unreadCount);
router.put("/read-all", ctrl.markAllRead);
router.put("/:id/read", ctrl.markRead);

export default router;
