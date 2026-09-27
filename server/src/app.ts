import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { entriesRouter } from "./routes/entries.routes.js";
import { tmdbRouter } from "./routes/tmdb.routes.js";

/**
 * The Express app, without `listen()`.
 * server.ts runs it locally; api/index.ts (repo root) exports it as a Vercel function.
 */
export const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ data: { ok: true } });
});
app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/tmdb", tmdbRouter);

app.use(notFoundHandler);
app.use(errorHandler);
