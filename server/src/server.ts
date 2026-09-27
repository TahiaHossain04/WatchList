import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`🍬 Tahia's Watch List API running on http://localhost:${config.port}`);
  if (config.demoMode) {
    console.log("   DEMO MODE: Supabase is not configured — data is saved in server/data/demo-db.json.");
  }
});
