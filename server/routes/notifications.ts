import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// POST /api/notifications/send
router.post("/send", async (req, res) => {
  try {
    const { user_ids, type, title, body, data } = req.body;
    if (!user_ids || !Array.isArray(user_ids)) {
      res.status(400).json({ error: "user_ids must be an array" });
      return;
    }
    // Filter users who have this notification type enabled
    const prefs = await pool.query(
      `SELECT user_id FROM notification_preferences WHERE user_id = ANY($1) AND ${type} = true`,
      [user_ids]
    );
    const eligible_user_ids = prefs.rows.map((r: any) => r.user_id);
    const skipped_user_ids = user_ids.filter((id: string) => !eligible_user_ids.includes(id));
    // In production, trigger push notifications here (e.g. FCM)
    res.json({
      eligible_user_ids,
      skipped_user_ids,
      total_targeted: user_ids.length,
      total_eligible: eligible_user_ids.length,
      total_skipped: skipped_user_ids.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to process notification" });
  }
});

export default router;
