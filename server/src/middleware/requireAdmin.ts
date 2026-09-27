import type { NextFunction, Request, Response } from "express";
import { verifyAdminToken } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";

export function getBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
}

/**
 * Guards write routes. Hiding buttons in React is only cosmetic —
 * this middleware is what actually stops non-admins from changing data.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) throw new HttpError(401, "Please log in first.");

  const admin = await verifyAdminToken(token);
  if (!admin) throw new HttpError(403, "You are not allowed to do that.");

  next();
}
