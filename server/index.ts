import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";
import fs from "fs";
import { runMigrations } from "./migrations.js";

import communityRouter from "./routes/community.js";
import bloodEmergencyRouter from "./routes/bloodEmergency.js";
import reviewsRouter from "./routes/reviews.js";
import adsRouter from "./routes/ads.js";
import researchRouter from "./routes/research.js";
import apiKeysRouter from "./routes/apiKeys.js";
import chatRouter from "./routes/chat.js";
import emergencyCardRouter from "./routes/emergencyCard.js";
import notificationPrefsRouter from "./routes/notificationPrefs.js";
import publicApiRouter from "./routes/publicApi.js";
import storageRouter from "./routes/storage.js";
import aiRouter from "./routes/ai.js";
import homepageRouter from "./routes/homepage.js";
import providersRouter from "./routes/providers.js";
import adminRouter from "./routes/admin.js";
import notificationsRouter from "./routes/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// API routes
app.use("/api/community", communityRouter);
app.use("/api/blood-emergency", bloodEmergencyRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/ads", adsRouter);
app.use("/api/research", researchRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/chat", chatRouter);
app.use("/api/emergency-card", emergencyCardRouter);
app.use("/api/notification-prefs", notificationPrefsRouter);
app.use("/api/public", publicApiRouter);
app.use("/api/storage", storageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/homepage", homepageRouter);
app.use("/api/providers", providersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend in production
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

runMigrations()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CityHealth server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[startup] Migration failed, server will not start:", err);
    process.exit(1);
  });

export default app;
