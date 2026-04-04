import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { createHash } from "crypto";

const router = Router();

// GET /api/api-keys/:developerId
router.get("/:developerId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, developer_id, key_suffix, app_name, app_description, plan, rate_limit_per_day, is_active, created_at FROM api_keys WHERE developer_id = $1 ORDER BY created_at DESC",
      [req.params.developerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// POST /api/api-keys — create a new key
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { developer_id, key_hash, key_suffix, app_name, app_description } = req.body;
    const result = await pool.query(
      `INSERT INTO api_keys (developer_id, key_hash, key_suffix, app_name, app_description)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, developer_id, key_suffix, app_name, app_description, plan, rate_limit_per_day, is_active, created_at`,
      [developer_id, key_hash, key_suffix, app_name || null, app_description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// PATCH /api/api-keys/:id/deactivate
router.patch("/:id/deactivate", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await pool.query("UPDATE api_keys SET is_active = false WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate key" });
  }
});

// PATCH /api/api-keys/:id/regenerate
router.patch("/:id/regenerate", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { key_hash, key_suffix } = req.body;
    await pool.query(
      "UPDATE api_keys SET key_hash = $1, key_suffix = $2, is_active = true WHERE id = $3",
      [key_hash, key_suffix, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to regenerate key" });
  }
});

// GET /api/api-keys/:keyId/usage
router.get("/:keyId/usage", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await pool.query(
      "SELECT date, request_count, endpoint FROM api_usage WHERE api_key_id = $1 AND date >= $2 ORDER BY date ASC",
      [req.params.keyId, sevenDaysAgo.toISOString().split("T")[0]]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch usage" });
  }
});

// GET /api/api-keys/:keyId/logs
router.get("/:keyId/logs", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || "50");
    const result = await pool.query(
      "SELECT id, endpoint, method, status_code, response_time_ms, created_at FROM api_logs WHERE api_key_id = $1 ORDER BY created_at DESC LIMIT $2",
      [req.params.keyId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Admin: GET /api/api-keys
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, developer_id, key_suffix, app_name, app_description, plan, rate_limit_per_day, is_active, created_at FROM api_keys ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all keys" });
  }
});

export default router;
