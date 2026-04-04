import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/research
router.get("/", async (req, res) => {
  try {
    const { search, category, sort = "newest", limit = "20", offset = "0", status, provider_id } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (provider_id) { conditions.push(`provider_id = $${idx++}`); params.push(provider_id); }
    if (search) { conditions.push(`(title ILIKE $${idx} OR abstract ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    let orderBy = "ORDER BY created_at DESC";
    if (sort === "popular") orderBy = "ORDER BY views_count DESC";
    else if (sort === "featured") orderBy = "ORDER BY is_featured DESC, created_at DESC";

    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(
      `SELECT * FROM research_articles ${where} ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// GET /api/research/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM research_articles WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ error: "Article not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// POST /api/research
router.post("/", async (req, res) => {
  try {
    const { provider_id, provider_name, provider_avatar, provider_type, provider_city, title, abstract, content, category, tags, doi, pdf_url } = req.body;
    const result = await pool.query(
      `INSERT INTO research_articles (provider_id, provider_name, provider_avatar, provider_type, provider_city, title, abstract, content, category, tags, doi, pdf_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [provider_id, provider_name, provider_avatar || null, provider_type || null, provider_city || null, title, abstract, content, category, tags || [], doi || null, pdf_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create article" });
  }
});

// PATCH /api/research/:id
router.patch("/:id", async (req, res) => {
  try {
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const fields = ["status", "is_featured", "rejection_reason", "title", "abstract", "content", "category", "tags", "doi", "pdf_url"];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        params.push(req.body[field]);
      }
    }
    updates.push("updated_at = now()");
    params.push(req.params.id);
    await pool.query(`UPDATE research_articles SET ${updates.join(", ")} WHERE id = $${idx}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update article" });
  }
});

// DELETE /api/research/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM research_articles WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete article" });
  }
});

// POST /api/research/:id/view
router.post("/:id/view", async (req, res) => {
  try {
    const { viewer_id } = req.body;
    await pool.query("UPDATE research_articles SET views_count = views_count + 1 WHERE id = $1", [req.params.id]);
    await pool.query("INSERT INTO article_views (article_id, viewer_id) VALUES ($1, $2)", [req.params.id, viewer_id || null]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record view" });
  }
});

// POST /api/research/:id/react
router.post("/:id/react", async (req, res) => {
  try {
    const { user_id, reaction_type = "like" } = req.body;
    const existing = await pool.query("SELECT id FROM article_reactions WHERE article_id = $1 AND user_id = $2", [req.params.id, user_id]);
    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM article_reactions WHERE article_id = $1 AND user_id = $2", [req.params.id, user_id]);
      await pool.query("UPDATE research_articles SET reactions_count = GREATEST(0, reactions_count - 1) WHERE id = $1", [req.params.id]);
      res.json({ reacted: false });
    } else {
      await pool.query("INSERT INTO article_reactions (article_id, user_id, reaction_type) VALUES ($1, $2, $3)", [req.params.id, user_id, reaction_type]);
      await pool.query("UPDATE research_articles SET reactions_count = reactions_count + 1 WHERE id = $1", [req.params.id]);
      res.json({ reacted: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle reaction" });
  }
});

// POST /api/research/:id/save
router.post("/:id/save", async (req, res) => {
  try {
    const { user_id } = req.body;
    const existing = await pool.query("SELECT id FROM article_saves WHERE article_id = $1 AND user_id = $2", [req.params.id, user_id]);
    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM article_saves WHERE article_id = $1 AND user_id = $2", [req.params.id, user_id]);
      await pool.query("UPDATE research_articles SET saves_count = GREATEST(0, saves_count - 1) WHERE id = $1", [req.params.id]);
      res.json({ saved: false });
    } else {
      await pool.query("INSERT INTO article_saves (article_id, user_id) VALUES ($1, $2)", [req.params.id, user_id]);
      await pool.query("UPDATE research_articles SET saves_count = saves_count + 1 WHERE id = $1", [req.params.id]);
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle save" });
  }
});

// GET /api/research/:id/user-status/:userId
router.get("/:id/user-status/:userId", async (req, res) => {
  try {
    const [reacted, saved] = await Promise.all([
      pool.query("SELECT id FROM article_reactions WHERE article_id = $1 AND user_id = $2", [req.params.id, req.params.userId]),
      pool.query("SELECT id FROM article_saves WHERE article_id = $1 AND user_id = $2", [req.params.id, req.params.userId]),
    ]);
    res.json({ reacted: reacted.rows.length > 0, saved: saved.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user status" });
  }
});

// GET /api/research/articles/featured
router.get("/articles/featured", async (req, res) => {
  try {
    const { limit = "5" } = req.query as Record<string, string>;
    const result = await pool.query(
      "SELECT * FROM research_articles WHERE status = 'approved' AND is_featured = true ORDER BY created_at DESC LIMIT $1",
      [parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured articles" });
  }
});

// GET /api/research/articles/all
router.get("/articles/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM research_articles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all articles" });
  }
});

// GET /api/research/articles/provider/:providerId
router.get("/articles/provider/:providerId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM research_articles WHERE provider_id = $1 ORDER BY created_at DESC",
      [req.params.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider articles" });
  }
});

// GET /api/research/articles/user/:userId/reactions
router.get("/articles/user/:userId/reactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT article_id FROM article_reactions WHERE user_id = $1", [req.params.userId]);
    res.json(result.rows.map((r: any) => r.article_id));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user reactions" });
  }
});

// GET /api/research/articles/user/:userId/saves
router.get("/articles/user/:userId/saves", async (req, res) => {
  try {
    const result = await pool.query("SELECT article_id FROM article_saves WHERE user_id = $1", [req.params.userId]);
    res.json(result.rows.map((r: any) => r.article_id));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user saves" });
  }
});

// GET /api/research/articles/user/:userId/saved
router.get("/articles/user/:userId/saved", async (req, res) => {
  try {
    const saves = await pool.query("SELECT article_id FROM article_saves WHERE user_id = $1", [req.params.userId]);
    if (!saves.rows.length) { res.json([]); return; }
    const ids = saves.rows.map((r: any) => r.article_id);
    const result = await pool.query("SELECT * FROM research_articles WHERE id = ANY($1) AND status = 'approved' ORDER BY created_at DESC", [ids]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved articles" });
  }
});

// POST /api/research/articles
router.post("/articles", async (req, res) => {
  try {
    const { provider_id, provider_name, provider_avatar, provider_type, provider_city, title, abstract, content, category, tags, doi, pdf_url, is_verified_provider } = req.body;
    const result = await pool.query(
      `INSERT INTO research_articles (provider_id, provider_name, provider_avatar, provider_type, provider_city, title, abstract, content, category, tags, doi, pdf_url, is_verified_provider, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending') RETURNING *`,
      [provider_id, provider_name, provider_avatar || null, provider_type || null, provider_city || null, title, abstract, content, category, tags || [], doi || null, pdf_url || null, is_verified_provider || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create article" });
  }
});

// PATCH /api/research/articles/:id/status
router.patch("/articles/:id/status", async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    await pool.query("UPDATE research_articles SET status = $1, rejection_reason = $2, updated_at = now() WHERE id = $3", [status, rejection_reason || null, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update article status" });
  }
});

// PATCH /api/research/articles/:id/featured
router.patch("/articles/:id/featured", async (req, res) => {
  try {
    const { is_featured } = req.body;
    await pool.query("UPDATE research_articles SET is_featured = $1, updated_at = now() WHERE id = $2", [is_featured, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle featured" });
  }
});

export default router;
