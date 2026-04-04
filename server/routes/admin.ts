import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM provider_reports ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// PATCH /api/admin/reports/:id
router.patch("/reports/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE provider_reports SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
