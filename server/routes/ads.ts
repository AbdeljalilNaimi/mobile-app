import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/ads
router.get("/", async (req, res) => {
  try {
    const { search, specialty, city, sort = "newest", limit = "20", offset = "0", status, provider_id } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (provider_id) { conditions.push(`provider_id = $${idx++}`); params.push(provider_id); }
    if (search) { conditions.push(`(title ILIKE $${idx} OR short_description ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (city) { conditions.push(`provider_city = $${idx++}`); params.push(city); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderBy = "ORDER BY created_at DESC";
    if (sort === "popular") orderBy = "ORDER BY views_count DESC";
    else if (sort === "featured") orderBy = "ORDER BY is_featured DESC, created_at DESC";

    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(
      `SELECT * FROM ads ${where} ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

// GET /api/ads/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ads WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ error: "Ad not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ad" });
  }
});

// POST /api/ads
router.post("/", async (req, res) => {
  try {
    const { provider_id, provider_name, provider_avatar, provider_type, provider_city, title, short_description, full_description, image_url, expires_at } = req.body;
    const result = await pool.query(
      `INSERT INTO ads (provider_id, provider_name, provider_avatar, provider_type, provider_city, title, short_description, full_description, image_url, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [provider_id, provider_name, provider_avatar || null, provider_type || null, provider_city || null, title, short_description, full_description, image_url, expires_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ad" });
  }
});

// PATCH /api/ads/:id
router.patch("/:id", async (req, res) => {
  try {
    const { status, is_featured, rejection_reason, title, short_description, full_description, image_url } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (status !== undefined) { updates.push(`status = $${idx++}`); params.push(status); }
    if (is_featured !== undefined) { updates.push(`is_featured = $${idx++}`); params.push(is_featured); }
    if (rejection_reason !== undefined) { updates.push(`rejection_reason = $${idx++}`); params.push(rejection_reason); }
    if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title); }
    if (short_description !== undefined) { updates.push(`short_description = $${idx++}`); params.push(short_description); }
    if (full_description !== undefined) { updates.push(`full_description = $${idx++}`); params.push(full_description); }
    if (image_url !== undefined) { updates.push(`image_url = $${idx++}`); params.push(image_url); }
    updates.push(`updated_at = now()`);
    params.push(req.params.id);
    await pool.query(`UPDATE ads SET ${updates.join(", ")} WHERE id = $${idx}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update ad" });
  }
});

// DELETE /api/ads/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ads WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ad" });
  }
});

// POST /api/ads/:id/view
router.post("/:id/view", async (req, res) => {
  try {
    await pool.query("UPDATE ads SET views_count = views_count + 1 WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record view" });
  }
});

// POST /api/ads/:id/like
router.post("/:id/like", async (req, res) => {
  try {
    const { user_id } = req.body;
    const existing = await pool.query("SELECT id FROM ad_likes WHERE ad_id = $1 AND user_id = $2", [req.params.id, user_id]);
    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM ad_likes WHERE ad_id = $1 AND user_id = $2", [req.params.id, user_id]);
      await pool.query("UPDATE ads SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", [req.params.id]);
      res.json({ liked: false });
    } else {
      await pool.query("INSERT INTO ad_likes (ad_id, user_id) VALUES ($1, $2)", [req.params.id, user_id]);
      await pool.query("UPDATE ads SET likes_count = likes_count + 1 WHERE id = $1", [req.params.id]);
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// POST /api/ads/:id/save
router.post("/:id/save", async (req, res) => {
  try {
    const { user_id } = req.body;
    const existing = await pool.query("SELECT id FROM ad_saves WHERE ad_id = $1 AND user_id = $2", [req.params.id, user_id]);
    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM ad_saves WHERE ad_id = $1 AND user_id = $2", [req.params.id, user_id]);
      await pool.query("UPDATE ads SET saves_count = GREATEST(0, saves_count - 1) WHERE id = $1", [req.params.id]);
      res.json({ saved: false });
    } else {
      await pool.query("INSERT INTO ad_saves (ad_id, user_id) VALUES ($1, $2)", [req.params.id, user_id]);
      await pool.query("UPDATE ads SET saves_count = saves_count + 1 WHERE id = $1", [req.params.id]);
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle save" });
  }
});

// GET /api/ads/:id/user-status/:userId
router.get("/:id/user-status/:userId", async (req, res) => {
  try {
    const [liked, saved] = await Promise.all([
      pool.query("SELECT id FROM ad_likes WHERE ad_id = $1 AND user_id = $2", [req.params.id, req.params.userId]),
      pool.query("SELECT id FROM ad_saves WHERE ad_id = $1 AND user_id = $2", [req.params.id, req.params.userId]),
    ]);
    res.json({ liked: liked.rows.length > 0, saved: saved.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user status" });
  }
});

// GET /api/ads/all
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ads ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all ads" });
  }
});

// GET /api/ads/provider/:providerId
router.get("/provider/:providerId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ads WHERE provider_id = $1 ORDER BY created_at DESC", [req.params.providerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider ads" });
  }
});

// GET /api/ads/user/:userId/likes
router.get("/user/:userId/likes", async (req, res) => {
  try {
    const result = await pool.query("SELECT ad_id FROM ad_likes WHERE user_id = $1", [req.params.userId]);
    res.json(result.rows.map((r: any) => r.ad_id));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user likes" });
  }
});

// GET /api/ads/user/:userId/saves
router.get("/user/:userId/saves", async (req, res) => {
  try {
    const result = await pool.query("SELECT ad_id FROM ad_saves WHERE user_id = $1", [req.params.userId]);
    res.json(result.rows.map((r: any) => r.ad_id));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user saves" });
  }
});

// GET /api/ads/user/:userId/saved-ads
router.get("/user/:userId/saved-ads", async (req, res) => {
  try {
    const saves = await pool.query("SELECT ad_id FROM ad_saves WHERE user_id = $1", [req.params.userId]);
    if (!saves.rows.length) { res.json([]); return; }
    const ids = saves.rows.map((r: any) => r.ad_id);
    const result = await pool.query(`SELECT * FROM ads WHERE id = ANY($1) AND status = 'approved' ORDER BY created_at DESC`, [ids]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved ads" });
  }
});

// GET /api/ads/reports
router.get("/reports", async (req, res) => {
  try {
    const result = await pool.query("SELECT ar.*, a.title AS ad_title, a.provider_name FROM ad_reports ar LEFT JOIN ads a ON a.id = ar.ad_id ORDER BY ar.created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ad reports" });
  }
});

// PATCH /api/ads/reports/:reportId/resolve
router.patch("/reports/:reportId/resolve", async (req, res) => {
  try {
    await pool.query("UPDATE ad_reports SET status = 'resolved' WHERE id = $1", [req.params.reportId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// PATCH /api/ads/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    await pool.query("UPDATE ads SET status = $1, rejection_reason = $2, updated_at = now() WHERE id = $3", [status, rejection_reason || null, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update ad status" });
  }
});

// PATCH /api/ads/:id/featured
router.patch("/:id/featured", async (req, res) => {
  try {
    const { is_featured } = req.body;
    await pool.query("UPDATE ads SET is_featured = $1, updated_at = now() WHERE id = $2", [is_featured, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle featured" });
  }
});

// POST /api/ads/:id/report
router.post("/:id/report", async (req, res) => {
  try {
    const { reporter_id, reason, details } = req.body;
    await pool.query(
      "INSERT INTO ad_reports (ad_id, reporter_id, reason, details) VALUES ($1, $2, $3, $4)",
      [req.params.id, reporter_id, reason, details || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;
