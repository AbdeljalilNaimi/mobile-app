import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/reviews/:providerId
router.get("/:providerId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM provider_reviews WHERE provider_id = $1 ORDER BY created_at DESC",
      [req.params.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews
router.post("/", async (req, res) => {
  try {
    const { provider_id, patient_id, patient_name, rating, comment } = req.body;
    const result = await pool.query(
      `INSERT INTO provider_reviews (provider_id, patient_id, patient_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [provider_id, patient_id, patient_name, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "You have already reviewed this provider" });
    } else {
      res.status(500).json({ error: "Failed to submit review" });
    }
  }
});

// DELETE /api/reviews/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM provider_reviews WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// POST /api/reviews/reports
router.post("/reports", async (req, res) => {
  try {
    const { provider_id, reporter_id, reason, details } = req.body;
    await pool.query(
      "INSERT INTO provider_reports (provider_id, reporter_id, reason, details) VALUES ($1, $2, $3, $4)",
      [provider_id, reporter_id, reason, details || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// GET /api/reviews/patient/:patientId
router.get("/patient/:patientId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM provider_reviews WHERE patient_id = $1 ORDER BY created_at DESC",
      [req.params.patientId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient reviews" });
  }
});

// GET /api/reviews/reviewed-providers?patient_id=&provider_ids=
router.get("/reviewed-providers", async (req, res) => {
  try {
    const { patient_id, provider_ids } = req.query as Record<string, string>;
    if (!patient_id || !provider_ids) { res.json([]); return; }
    const ids = provider_ids.split(",");
    const result = await pool.query(
      "SELECT provider_id FROM provider_reviews WHERE patient_id = $1 AND provider_id = ANY($2)",
      [patient_id, ids]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviewed providers" });
  }
});

export default router;
