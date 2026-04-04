import { Router } from "express";
import { pool } from "../db.js";
import { createHash } from "crypto";

const router = Router();

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; keyId?: string; rateLimit?: number }> {
  const hash = createHash("sha256").update(apiKey).digest("hex");
  const result = await pool.query(
    "SELECT id, rate_limit_per_day FROM api_keys WHERE key_hash = $1 AND is_active = true",
    [hash]
  );
  if (!result.rows[0]) return { valid: false };
  return { valid: true, keyId: result.rows[0].id, rateLimit: result.rows[0].rate_limit_per_day };
}

async function checkRateLimit(keyId: string, rateLimit: number, endpoint: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const result = await pool.query(
    "SELECT request_count FROM api_usage WHERE api_key_id = $1 AND date = $2 AND endpoint = $3",
    [keyId, today, endpoint]
  );
  if (result.rows[0] && result.rows[0].request_count >= rateLimit) return false;
  return true;
}

async function recordUsage(keyId: string, endpoint: string, method: string, statusCode: number, responseTimeMs: number) {
  const today = new Date().toISOString().split("T")[0];
  await pool.query(
    `INSERT INTO api_usage (api_key_id, date, endpoint, request_count)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (api_key_id, date, endpoint) DO UPDATE SET request_count = api_usage.request_count + 1`,
    [keyId, today, endpoint]
  );
  await pool.query(
    "INSERT INTO api_logs (api_key_id, endpoint, method, status_code, response_time_ms) VALUES ($1, $2, $3, $4, $5)",
    [keyId, endpoint, method, statusCode, responseTimeMs]
  );
}

// Middleware for all public API routes
router.use(async (req: any, res: any, next: any) => {
  const apiKey = req.headers["x-api-key"] as string;
  if (!apiKey) {
    res.status(401).json({ error: "Missing x-api-key header" });
    return;
  }
  const { valid, keyId, rateLimit } = await validateApiKey(apiKey);
  if (!valid) {
    res.status(403).json({ error: "Invalid or inactive API key" });
    return;
  }
  const endpoint = req.path;
  const allowed = await checkRateLimit(keyId!, rateLimit!, endpoint);
  if (!allowed) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }
  req.apiKeyId = keyId;
  req.rateLimit = rateLimit;
  const startTime = Date.now();
  res.on("finish", () => {
    recordUsage(keyId!, endpoint, req.method, res.statusCode, Date.now() - startTime).catch(console.error);
  });
  next();
});

// GET /api/public/providers
router.get("/providers", async (req, res) => {
  try {
    const { type, city, search, verified, is_24h, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (type) { conditions.push(`type = $${idx++}`); params.push(type); }
    if (city) { conditions.push(`city ILIKE $${idx++}`); params.push(`%${city}%`); }
    if (search) { conditions.push(`(name ILIKE $${idx} OR specialty ILIKE $${idx} OR address ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (verified === "true") { conditions.push(`is_verified = true`); }
    if (is_24h === "true") { conditions.push(`is_24h = true`); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(
      `SELECT * FROM providers_public ${where} ORDER BY is_verified DESC, rating DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    res.json({ providers: result.rows, count: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// GET /api/public/providers/:id
router.get("/providers/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM providers_public WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ error: "Provider not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider" });
  }
});

// GET /api/public/stats
router.get("/stats", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT type, COUNT(*) as count, AVG(rating) as avg_rating FROM providers_public WHERE is_verified = true GROUP BY type"
    );
    res.json({ stats: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
