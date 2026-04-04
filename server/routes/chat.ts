import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/chat/conversations/:userId
router.get("/conversations/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM chat_conversations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50",
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// POST /api/chat/conversations
router.post("/conversations", async (req, res) => {
  try {
    const { user_id, title } = req.body;
    const result = await pool.query(
      "INSERT INTO chat_conversations (user_id, title) VALUES ($1, $2) RETURNING *",
      [user_id, title || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// PATCH /api/chat/conversations/:id
router.patch("/conversations/:id", async (req, res) => {
  try {
    const { title } = req.body;
    await pool.query(
      "UPDATE chat_conversations SET title = $1, updated_at = now() WHERE id = $2",
      [title, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// DELETE /api/chat/conversations/:id
router.delete("/conversations/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM chat_conversations WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// GET /api/chat/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT role, content FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [req.params.conversationId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/chat/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { messages } = req.body; // array of {role, content}
    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "messages must be an array" });
      return;
    }
    for (const msg of messages) {
      await pool.query(
        "INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)",
        [req.params.conversationId, msg.role, msg.content]
      );
    }
    // Update conversation updated_at
    await pool.query(
      "UPDATE chat_conversations SET updated_at = now() WHERE id = $1",
      [req.params.conversationId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save messages" });
  }
});

export default router;
