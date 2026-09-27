import { Router } from "express";
import { config } from "../config.js";
import { getBearerToken } from "../middleware/requireAdmin.js";
import { verifyAdminToken } from "../services/auth.service.js";

export const authRouter = Router();

/** Lets the client ask "is the person holding this token the admin?" */
authRouter.get("/me", async (req, res) => {
  const admin = await verifyAdminToken(getBearerToken(req));
  res.json({ data: { isAdmin: Boolean(admin), email: admin?.email ?? null } });
});

/** Tells the client whether the server is running with demo data. */
authRouter.get("/mode", (_req, res) => {
  res.json({ data: { demoMode: config.demoMode } });
});
