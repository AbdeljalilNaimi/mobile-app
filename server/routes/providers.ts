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
  // Validate sync secret — must match SYNC_SECRET env var
  const syncSecret = process.env.SYNC_SECRET;
  const providedSecret = req.headers["x-sync-secret"];
  if (!syncSecret) {
    res.status(503).json({ error: "Sync is not configured (SYNC_SECRET missing on server)" });
    return;
  }
  if (!providedSecret || providedSecret !== syncSecret) {
    res.status(403).json({ error: "Invalid sync secret" });
    return;
  }

  try {
    const providers = req.body;
    if (!Array.isArray(providers)) {
      res.status(400).json({ error: "Expected array of providers" });
      return;
    }
    let upserted: string[] = [];
    const errors: string[] = [];
    for (const p of providers) {
      try {
        const isPremium = p.planType === 'premium';
        await pool.query(
          `INSERT INTO providers_public (
             id, name, type, specialty, address, city, area, phone,
             lat, lng, is_verified, is_24h, is_open, rating, reviews_count,
             description, languages, image_url, night_duty, is_premium
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
           ON CONFLICT (id) DO UPDATE SET
             name=EXCLUDED.name, type=EXCLUDED.type, specialty=EXCLUDED.specialty,
             address=EXCLUDED.address, city=EXCLUDED.city, area=EXCLUDED.area,
             phone=EXCLUDED.phone, lat=EXCLUDED.lat, lng=EXCLUDED.lng,
             is_verified=EXCLUDED.is_verified, is_24h=EXCLUDED.is_24h,
             is_open=EXCLUDED.is_open, rating=EXCLUDED.rating,
             reviews_count=EXCLUDED.reviews_count, description=EXCLUDED.description,
             languages=EXCLUDED.languages, image_url=EXCLUDED.image_url,
             night_duty=EXCLUDED.night_duty, is_premium=EXCLUDED.is_premium`,
          [
            p.id, p.name, p.type, p.specialty || null,
            p.address || null, p.city || null, p.area || null, p.phone || null,
            p.lat || null, p.lng || null,
            Boolean(p.verified || p.is_verified),
            Boolean(p.is24_7 || p.is_24h),
            Boolean(p.isOpen !== undefined ? p.isOpen : p.is_open !== undefined ? p.is_open : true),
            Number(p.rating) || 0, Number(p.reviewsCount || p.reviews_count) || 0,
            p.description || null,
            Array.isArray(p.languages) ? p.languages : (p.languages ? [p.languages] : null),
            p.image || p.image_url || null,
            Boolean(p.nightDuty || p.night_duty),
            isPremium,
          ]
        );
        upserted.push(p.id);
      } catch (rowErr: unknown) {
        const msg = rowErr instanceof Error ? rowErr.message : String(rowErr);
        errors.push(`${p.id}: ${msg}`);
      }
    }
    res.json({ data: { upserted, removed: [], errors } });
  } catch (err) {
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
