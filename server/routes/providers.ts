import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/providers/:id/quote-requests
router.get("/:id/quote-requests", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM quote_requests WHERE provider_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quote requests" });
  }
});

// POST /api/providers/quote-requests
router.post("/quote-requests", async (req, res) => {
  try {
    const { provider_id, client_name, client_phone, equipment, details } = req.body;
    const result = await pool.query(
      "INSERT INTO quote_requests (provider_id, client_name, client_phone, equipment, details) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [provider_id, client_name, client_phone, equipment, details || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create quote request" });
  }
});

// PATCH /api/providers/quote-requests/:id
router.patch("/quote-requests/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE quote_requests SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update quote request" });
  }
});

// POST /api/providers/reports
router.post("/reports", async (req, res) => {
  try {
    const { provider_id, reporter_id, reason, details } = req.body;
    const result = await pool.query(
      "INSERT INTO provider_reports (provider_id, reporter_id, reason, details) VALUES ($1,$2,$3,$4) RETURNING *",
      [provider_id, reporter_id, reason, details || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// POST /api/providers/sync
router.post("/sync", async (req, res) => {
  try {
    const providers = req.body;
    if (!Array.isArray(providers)) {
      res.status(400).json({ error: "Expected array of providers" });
      return;
    }
    let upserted: string[] = [];
    for (const p of providers) {
      await pool.query(
        `INSERT INTO providers (id, name, type, city, specialty, phone, address, verified, avatar_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, type=EXCLUDED.type, city=EXCLUDED.city,
         specialty=EXCLUDED.specialty, phone=EXCLUDED.phone, address=EXCLUDED.address,
         verified=EXCLUDED.verified, avatar_url=EXCLUDED.avatar_url`,
        [p.id, p.name, p.type, p.city, p.specialty, p.phone, p.address, p.verified, p.avatar_url]
      );
      upserted.push(p.id);
    }
    res.json({ data: { upserted, removed: [], errors: [] } });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
