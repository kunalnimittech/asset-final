import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import userRoutes from "../modules/users/user.routes.js";

// Register every module here. New module = one new line.
const router = Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);

export default router;
