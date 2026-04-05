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

    // M002 — seed 4 approved ads linked to reference providers (idempotent)
    await client.query(`
      INSERT INTO ads (
        provider_id, provider_name, provider_avatar, provider_type, provider_city,
        title, short_description, full_description,
        image_url, status, is_featured, is_verified_provider,
        views_count, likes_count, saves_count
      )
      SELECT * FROM (VALUES
        (
          'ref-hospital-1',
          'CHU Sidi Bel Abbès - Hassani Abdelkader',
          NULL,
          'Hôpital Universitaire',
          'Sidi Bel Abbès',
          'Urgences 24h/7j — Prise en charge immédiate',
          'Service des urgences disponible toute la nuit. Équipes médicales spécialisées sur place.',
          'Notre service des urgences est opérationnel 24h/24 et 7j/7. Nous disposons d''une équipe pluridisciplinaire : chirurgiens, internistes, cardiologues et pédiatres. Venez sans rendez-vous en cas d''urgence médicale. Ambulances disponibles au +213 48 54 12 34.',
          'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=75',
          'approved',
          TRUE,
          TRUE,
          128,
          34,
          12
        ),
        (
          'ref-clinic-1',
          'Clinique El Hayat',
          NULL,
          'Clinique Privée',
          'Sidi Bel Abbès',
          'Consultations spécialisées — Cardiologie & Chirurgie',
          'Prenez rendez-vous avec nos spécialistes en cardiologie, chirurgie générale et orthopédie.',
          'La Clinique El Hayat met à votre disposition des consultations spécialisées en cardiologie, chirurgie générale, orthopédie et gynécologie. Nos praticiens agréés vous reçoivent du lundi au samedi de 8h à 18h. Appelez le +213 48 61 00 10 pour réserver votre consultation.',
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=75',
          'approved',
          FALSE,
          TRUE,
          95,
          21,
          8
        ),
        (
          'ref-lab-1',
          'Laboratoire BioSanté',
          NULL,
          'Laboratoire d''Analyses',
          'Sidi Bel Abbès',
          'Résultats d''analyses en 4h — Prélèvement à domicile',
          'Analyses médicales rapides avec résultats en ligne. Service de prélèvement à domicile disponible.',
          'BioSanté vous propose plus de 300 analyses médicales avec des résultats disponibles en ligne en moins de 4 heures. Service de prélèvement à domicile sur rendez-vous. NFS, bilan hépatique, sérologies, hormones et bien plus. Résultats envoyés par SMS et email. Ouvert de 7h à 17h du dimanche au jeudi.',
          'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&q=75',
          'approved',
          TRUE,
          TRUE,
          72,
          18,
          5
        ),
        (
          'ref-pharmacy-1',
          'Pharmacie Centrale Bel Abbès',
          NULL,
          'Pharmacie',
          'Sidi Bel Abbès',
          'Médicaments & Parapharmacie — Livraison à domicile',
          'Grande gamme de médicaments et produits parapharmacie. Livraison rapide dans tout Sidi Bel Abbès.',
          'La Pharmacie Centrale vous offre un large stock de médicaments, produits d''hygiène, compléments alimentaires et matériel médical. Commandez par téléphone ou WhatsApp et recevez votre commande à domicile en moins de 2 heures dans la zone centre-ville. Pharmacie de garde certains week-ends. Appelez le +213 48 70 20 30.',
          'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=75',
          'approved',
          FALSE,
          TRUE,
          56,
          9,
          3
        )
      ) AS v(
        provider_id, provider_name, provider_avatar, provider_type, provider_city,
        title, short_description, full_description,
        image_url, status, is_featured, is_verified_provider,
        views_count, likes_count, saves_count
      )
      WHERE NOT EXISTS (
        SELECT 1 FROM ads WHERE provider_id = v.provider_id AND title = v.title
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
