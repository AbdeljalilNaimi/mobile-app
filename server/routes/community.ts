import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/community/posts
router.get("/posts", async (req, res) => {
  try {
    const { category, sort = "newest", search, page = "0", pageSize = "10", adminOnly, excludeAdminUnpinned } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const offset = pageNum * pageSizeNum;

    let conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (adminOnly === "true") {
      conditions.push(`is_admin_post = true`);
    } else {
      if (category) {
        conditions.push(`category = $${paramIdx++}`);
        params.push(category);
      }
      if (excludeAdminUnpinned === "true") {
        conditions.push(`(is_admin_post = false OR is_pinned = true)`);
      }
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIdx} OR content ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderClause = "ORDER BY created_at DESC";
    if (sort === "most_upvoted") orderClause = "ORDER BY upvotes_count DESC";
    else if (sort === "most_discussed") orderClause = "ORDER BY comments_count DESC";
    else if (sort === "newest") orderClause = "ORDER BY is_pinned DESC, created_at DESC";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM community_posts ${whereClause}`,
      params
    );

    params.push(pageSizeNum + 1, offset);
    const result = await pool.query(
      `SELECT * FROM community_posts ${whereClause} ${orderClause} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      params
    );

    const posts = result.rows.slice(0, pageSizeNum);
    const hasMore = result.rows.length > pageSizeNum;

    res.json({ posts, hasMore, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error("GET /community/posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/community/posts/admin-count
router.get("/posts/admin-count", async (req, res) => {
  try {
    const { since } = req.query as { since?: string };
    let q = "SELECT COUNT(*) FROM community_posts WHERE is_admin_post = true";
    const params: unknown[] = [];
    if (since) {
      q += " AND created_at > $1";
      params.push(since);
    }
    const result = await pool.query(q, params);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

// POST /api/community/posts
router.post("/posts", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { user_id, user_name, user_avatar, title, content, category, is_anonymous } = req.body;
    const result = await pool.query(
      `INSERT INTO community_posts (user_id, user_name, user_avatar, title, content, category, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user_id,
        is_anonymous ? null : user_name,
        is_anonymous ? null : user_avatar,
        title,
        content,
        category,
        is_anonymous || false,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /community/posts error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PATCH /api/community/posts/:id
router.patch("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, is_pinned } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title); }
    if (content !== undefined) { updates.push(`content = $${idx++}`); params.push(content); }
    if (category !== undefined) { updates.push(`category = $${idx++}`); params.push(category); }
    if (is_pinned !== undefined) { updates.push(`is_pinned = $${idx++}`); params.push(is_pinned); }
    updates.push(`updated_at = now()`);
    params.push(id);
    await pool.query(`UPDATE community_posts SET ${updates.join(", ")} WHERE id = $${idx}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/community/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM community_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// GET /api/community/posts/:postId/comments
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM community_comments WHERE post_id = $1 ORDER BY created_at ASC",
      [req.params.postId]
    );
    const comments = result.rows;
    const topLevel = comments.filter((c: any) => !c.parent_comment_id);
    const replies = comments.filter((c: any) => c.parent_comment_id);
    const nested = topLevel.map((c: any) => ({
      ...c,
      replies: replies.filter((r: any) => r.parent_comment_id === c.id),
    }));
    res.json(nested);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/community/posts/:postId/comments
router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const { user_id, user_name, user_avatar, parent_comment_id, content, is_anonymous } = req.body;
    const result = await pool.query(
      `INSERT INTO community_comments (post_id, user_id, user_name, user_avatar, parent_comment_id, content, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.params.postId,
        user_id,
        is_anonymous ? null : user_name,
        is_anonymous ? null : user_avatar,
        parent_comment_id || null,
        content,
        is_anonymous || false,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// PATCH /api/community/comments/:id
router.patch("/comments/:id", async (req, res) => {
  try {
    const { content } = req.body;
    await pool.query(
      "UPDATE community_comments SET content = $1, updated_at = now() WHERE id = $2",
      [content, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// DELETE /api/community/comments/:id
router.delete("/comments/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM community_comments WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// POST /api/community/upvotes/toggle
router.post("/upvotes/toggle", async (req, res) => {
  try {
    const { userId, postId, commentId } = req.body;
    let existingQuery = "SELECT id FROM community_upvotes WHERE user_id = $1";
    const params: unknown[] = [userId];
    if (postId) { existingQuery += " AND post_id = $2"; params.push(postId); }
    if (commentId) { existingQuery += " AND comment_id = $2"; params.push(commentId); }
    const existing = await pool.query(existingQuery, params);
    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM community_upvotes WHERE id = $1", [existing.rows[0].id]);
      res.json({ upvoted: false });
    } else {
      const insertParams: unknown[] = [userId, postId || null, commentId || null];
      await pool.query(
        "INSERT INTO community_upvotes (user_id, post_id, comment_id) VALUES ($1, $2, $3)",
        insertParams
      );
      res.json({ upvoted: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle upvote" });
  }
});

// GET /api/community/upvotes/:userId
router.get("/upvotes/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT post_id, comment_id FROM community_upvotes WHERE user_id = $1",
      [req.params.userId]
    );
    res.json({
      postIds: result.rows.filter((u: any) => u.post_id).map((u: any) => u.post_id),
      commentIds: result.rows.filter((u: any) => u.comment_id).map((u: any) => u.comment_id),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upvotes" });
  }
});

// POST /api/community/reports
router.post("/reports", async (req, res) => {
  try {
    const { reporter_id, post_id, comment_id, reason, details } = req.body;
    await pool.query(
      "INSERT INTO community_reports (reporter_id, post_id, comment_id, reason, details) VALUES ($1, $2, $3, $4, $5)",
      [reporter_id, post_id || null, comment_id || null, reason, details || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// GET /api/community/reports (admin)
router.get("/reports", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM community_reports ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// PATCH /api/community/reports/:id
router.patch("/reports/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE community_reports SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
