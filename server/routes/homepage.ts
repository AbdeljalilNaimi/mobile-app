import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/homepage/ads
router.get("/ads", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, short_description, provider_name, is_featured, is_verified_provider, image_url, provider_avatar, status
       FROM ads WHERE status = 'approved' ORDER BY created_at DESC LIMIT 4`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

// GET /api/homepage/articles
router.get("/articles", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, provider_name, views_count, status
       FROM research_articles WHERE status = 'approved' ORDER BY created_at DESC LIMIT 2`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// GET /api/homepage/community
router.get("/community", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, category, comments_count
       FROM community_posts ORDER BY created_at DESC LIMIT 4`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
});

export default router;
