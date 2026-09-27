import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

/** Every error response has the same shape: { error: { message, details? } }. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    // Map validation issues to { fieldName: message } so the form can show them per field.
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "form";
      fields[key] ??= issue.message;
    }
    res.status(400).json({ error: { message: "Some fields need another look.", details: fields } });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, details: err.details } });
    return;
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: { message: "Invalid JSON body." } });
    return;
  }

  console.error("[server] Unexpected error:", err);
  res.status(500).json({ error: { message: "Something went wrong on our side." } });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Route not found." } });
}
