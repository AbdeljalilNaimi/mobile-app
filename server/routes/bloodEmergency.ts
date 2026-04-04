import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/blood-emergency/active
router.get("/active", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blood_emergencies WHERE status = 'active' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergencies" });
  }
});

// GET /api/blood-emergency/provider/:providerId
router.get("/provider/:providerId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blood_emergencies WHERE provider_id = $1 ORDER BY created_at DESC",
      [req.params.providerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider emergencies" });
  }
});

// POST /api/blood-emergency
router.post("/", async (req, res) => {
  try {
    const { provider_id, provider_name, provider_lat, provider_lng, blood_type_needed, urgency_level, message } = req.body;
    const result = await pool.query(
      `INSERT INTO blood_emergencies (provider_id, provider_name, provider_lat, provider_lng, blood_type_needed, urgency_level, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [provider_id, provider_name || null, provider_lat || null, provider_lng || null, blood_type_needed, urgency_level, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to broadcast emergency" });
  }
});

// PATCH /api/blood-emergency/:id/resolve
router.patch("/:id/resolve", async (req, res) => {
  try {
    await pool.query(
      "UPDATE blood_emergencies SET status = 'resolved', resolved_at = now() WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve emergency" });
  }
});

// GET /api/blood-emergency/:emergencyId/responses
router.get("/:emergencyId/responses", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blood_emergency_responses WHERE emergency_id = $1 ORDER BY created_at DESC",
      [req.params.emergencyId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// POST /api/blood-emergency/:emergencyId/respond
router.post("/:emergencyId/respond", async (req, res) => {
  try {
    const { citizen_id, citizen_name, citizen_phone } = req.body;
    const result = await pool.query(
      `INSERT INTO blood_emergency_responses (emergency_id, citizen_id, citizen_name, citizen_phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.emergencyId, citizen_id, citizen_name || null, citizen_phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to respond to emergency" });
  }
});

// DELETE /api/blood-emergency/responses/:responseId
router.delete("/responses/:responseId", async (req, res) => {
  try {
    await pool.query("DELETE FROM blood_emergency_responses WHERE id = $1", [req.params.responseId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel response" });
  }
});

// POST /api/blood-emergency/donations
router.post("/donations", async (req, res) => {
  try {
    const { citizen_id, provider_id, provider_name, blood_type, emergency_id, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO donation_history (citizen_id, provider_id, provider_name, blood_type, emergency_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [citizen_id, provider_id, provider_name || null, blood_type, emergency_id || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to record donation" });
  }
});

// GET /api/blood-emergency/donations/:citizenId
router.get("/donations/:citizenId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM donation_history WHERE citizen_id = $1 ORDER BY donated_at DESC",
      [req.params.citizenId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

export default router;
