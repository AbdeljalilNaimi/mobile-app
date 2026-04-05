import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/homepage/ads
router.get("/ads", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, short_description, provider_name, provider_id, is_featured, is_verified_provider, image_url, provider_avatar, status
       FROM ads WHERE status = 'approved' ORDER BY is_featured DESC, created_at DESC LIMIT 4`
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

// GET /api/homepage/premium-providers
router.get("/premium-providers", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, type, specialty, address, city, area, phone, lat, lng,
              is_verified, is_24h, is_open, rating, reviews_count, description,
              languages, image_url, night_duty, is_premium
       FROM providers_public
       WHERE is_premium = true
       ORDER BY rating DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch premium providers" });
  }
});

export default router;
