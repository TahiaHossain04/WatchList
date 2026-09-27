import type { Request, Response } from "express";
import { z } from "zod";
import { createEntry as createEntryWithRules, entryStore, updateEntry as updateEntryWithRules } from "../services/entries.service.js";
import { createEntrySchema, entryFiltersSchema, updateEntrySchema } from "../types/entry.js";
import { HttpError } from "../utils/httpError.js";

// Express 5 forwards thrown/rejected errors to errorHandler automatically.

const idSchema = z.uuid();

function parseId(req: Request): string {
  const result = idSchema.safeParse(req.params.id);
  if (!result.success) throw new HttpError(404, "Entry not found.");
  return result.data;
}

export async function listEntries(req: Request, res: Response) {
  const filters = entryFiltersSchema.parse(req.query);
  const entries = await entryStore.list(filters);
  res.json({ data: entries });
}

export async function getEntry(req: Request, res: Response) {
  const entry = await entryStore.get(parseId(req));
  if (!entry) throw new HttpError(404, "Entry not found.");
  res.json({ data: entry });
}

export async function createEntry(req: Request, res: Response) {
  const input = createEntrySchema.parse(req.body);
  const entry = await createEntryWithRules(input);
  res.status(201).json({ data: entry });
}

export async function updateEntry(req: Request, res: Response) {
  const id = parseId(req);
  const input = updateEntrySchema.parse(req.body);
  const entry = await updateEntryWithRules(id, input);
  if (!entry) throw new HttpError(404, "Entry not found.");
  res.json({ data: entry });
}

export async function deleteEntry(req: Request, res: Response) {
  const deleted = await entryStore.remove(parseId(req));
  if (!deleted) throw new HttpError(404, "Entry not found.");
  res.status(204).end();
}
