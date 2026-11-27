import { Router } from "express";
import * as ctrl from "./user.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Any signed-in user
router.get("/me", requireAuth, ctrl.me);

// Admins only
router.use(requireAuth, requireRole(ROLES.ADMIN));
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
