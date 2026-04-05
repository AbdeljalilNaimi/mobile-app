import { pool } from "./db.js";

/**
 * Run incremental schema migrations at startup.
 * All statements use IF EXISTS / IF NOT EXISTS so they are idempotent.
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // M001 — add is_premium column to providers_public (idempotent)
    await client.query(`
      ALTER TABLE providers_public
      ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false
    `);

    // M001-seed — mark top 3 providers by rating as premium if none are set yet
    // This is a one-time seed: no-op when table is empty or premium already set
    await client.query(`
      UPDATE providers_public
      SET is_premium = true
      WHERE id IN (
        SELECT id FROM providers_public
        WHERE is_premium = false
        ORDER BY rating DESC
        LIMIT 3
      )
      AND NOT EXISTS (
        SELECT 1 FROM providers_public WHERE is_premium = true
      )
    `);

    await client.query("COMMIT");
    console.log("[migrations] Schema migrations applied successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[migrations] Migration failed, rolled back:", err);
    throw err;
  } finally {
    client.release();
  }
}
