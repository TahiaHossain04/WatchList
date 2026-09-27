import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { searchTmdb } from "../services/tmdb.service.js";
import { MEDIA_TYPES } from "../types/entry.js";

export const tmdbRouter = Router();

const searchSchema = z.object({
  q: z.string().trim().min(1).max(200),
  type: z.enum(MEDIA_TYPES).optional(),
});

// Admin only, so visitors can't use up the TMDB quota.
tmdbRouter.get("/search", requireAdmin, async (req, res) => {
  const { q, type } = searchSchema.parse(req.query);
  const results = await searchTmdb(q, type);
  res.json({ data: results.slice(0, 12) });
});
