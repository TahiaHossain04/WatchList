import { Router } from "express";
import {
  createEntry,
  deleteEntry,
  getEntry,
  listEntries,
  updateEntry,
} from "../controllers/entries.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const entriesRouter = Router();

// Public — anyone can browse.
entriesRouter.get("/", listEntries);
entriesRouter.get("/:id", getEntry);

// Admin only.
entriesRouter.post("/", requireAdmin, createEntry);
entriesRouter.patch("/:id", requireAdmin, updateEntry);
entriesRouter.delete("/:id", requireAdmin, deleteEntry);
