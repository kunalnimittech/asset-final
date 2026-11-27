import { Router } from "express";
import { prisma } from "../../lib/prisma-client.js";
import { requireAuth } from "../../middleware/auth.js";

// GET /api/roles — the role list (for the admin's role picker and labels).
const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const roles = await prisma.role.findMany({
    where: { status: "Active" },
    orderBy: { id: "asc" },
    select: { key: true, name: true, description: true, dashboard: true, isSystem: true },
  });
  res.json(roles);
});

export default router;
