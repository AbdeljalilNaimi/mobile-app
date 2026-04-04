import { Router } from "express";
import { pool } from "../db.js";
import { randomUUID } from "crypto";

const router = Router();

// GET /api/emergency-card/:userId
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM emergency_health_cards WHERE user_id = $1",
      [req.params.userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// GET /api/emergency-card/token/:token
router.get("/token/:token", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM emergency_health_cards WHERE share_token = $1",
      [req.params.token]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// PUT /api/emergency-card/:userId
router.put("/:userId", async (req, res) => {
  try {
    const {
      blood_group,
      allergies,
      chronic_conditions,
      current_medications,
      vaccination_history,
      emergency_contact_name,
      emergency_contact_phone,
      is_public_for_emergencies,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO emergency_health_cards
        (user_id, blood_group, allergies, chronic_conditions, current_medications, vaccination_history,
         emergency_contact_name, emergency_contact_phone, is_public_for_emergencies, share_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
         blood_group = EXCLUDED.blood_group,
         allergies = EXCLUDED.allergies,
         chronic_conditions = EXCLUDED.chronic_conditions,
         current_medications = EXCLUDED.current_medications,
         vaccination_history = EXCLUDED.vaccination_history,
         emergency_contact_name = EXCLUDED.emergency_contact_name,
         emergency_contact_phone = EXCLUDED.emergency_contact_phone,
         is_public_for_emergencies = EXCLUDED.is_public_for_emergencies,
         updated_at = now()
       RETURNING *`,
      [
        req.params.userId,
        blood_group || null,
        allergies || [],
        chronic_conditions || [],
        current_medications || [],
        vaccination_history || null,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        is_public_for_emergencies || false,
        randomUUID(),
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save card" });
  }
});

// DELETE /api/emergency-card/:userId
router.delete("/:userId", async (req, res) => {
  try {
    await pool.query("DELETE FROM emergency_health_cards WHERE user_id = $1", [req.params.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// POST /api/emergency-card/log-scan
router.post("/log-scan", async (req, res) => {
  try {
    const { card_id, card_user_id, provider_uid, provider_name, provider_type } = req.body;
    await pool.query(
      `INSERT INTO card_consultation_logs (card_id, card_user_id, provider_uid, provider_name, provider_type)
       VALUES ($1, $2, $3, $4, $5)`,
      [card_id, card_user_id, provider_uid, provider_name || null, provider_type || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to log scan" });
  }
});

// GET /api/emergency-card/:userId/scan-logs
router.get("/:userId/scan-logs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cl.* FROM card_consultation_logs cl
       JOIN emergency_health_cards c ON cl.card_id = c.id
       WHERE cl.card_user_id = $1
       ORDER BY cl.scanned_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scan logs" });
  }
});

export default router;
