import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { entriesRouter } from "./routes/entries.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ data: { ok: true } });
});
app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);
// Future: app.use("/api/tmdb", tmdbRouter) — search proxy so the TMDB key stays server-side.

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🍬 Tahia's Watch List API running on http://localhost:${config.port}`);
  if (config.demoMode) {
    console.log("   DEMO MODE: Supabase is not configured — data is saved in server/data/demo-db.json.");
  }
});
