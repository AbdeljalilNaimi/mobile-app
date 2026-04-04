import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/notification-prefs/:userId
router.get("/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notification_preferences WHERE user_id = $1",
      [req.params.userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// PUT /api/notification-prefs/:userId
router.put("/:userId", async (req, res) => {
  try {
    const { appointments, blood_emergencies, messages } = req.body;
    const result = await pool.query(
      `INSERT INTO notification_preferences (user_id, appointments, blood_emergencies, messages)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         appointments = EXCLUDED.appointments,
         blood_emergencies = EXCLUDED.blood_emergencies,
         messages = EXCLUDED.messages,
         updated_at = now()
       RETURNING *`,
      [req.params.userId, appointments, blood_emergencies, messages]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

export default router;
