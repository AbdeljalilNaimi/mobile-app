import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  user_ids: string[];
  type: "appointments" | "blood_emergencies" | "messages";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: NotificationPayload = await req.json();
    const { user_ids, type, title, body, data } = payload;

    if (!user_ids?.length || !type || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_ids, type, title, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch notification preferences for all target users
    const { data: prefsRows, error: prefsError } = await supabaseAdmin
      .from("notification_preferences")
      .select("user_id, appointments, blood_emergencies, messages")
      .in("user_id", user_ids);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch notification preferences" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a map of user_id -> preference for the requested type
    const prefsMap = new Map<string, boolean>();
    for (const row of prefsRows ?? []) {
      prefsMap.set(row.user_id, row[type] ?? true);
    }

    // Filter: users with no row default to true (opted-in), users with pref=false are excluded
    const eligibleUserIds = user_ids.filter((uid) => {
      const pref = prefsMap.get(uid);
      return pref === undefined || pref === true;
    });

    const skippedUserIds = user_ids.filter((uid) => !eligibleUserIds.includes(uid));

    console.log(
      `[send-notification] type=${type} | total=${user_ids.length} | eligible=${eligibleUserIds.length} | skipped=${skippedUserIds.length}`
    );

    // Here you would integrate with a push service (FCM, APNs, Web Push, etc.)
    // For now we return the filtered list so callers know who should be notified
    const result = {
      type,
      title,
      body,
      data: data ?? null,
      eligible_user_ids: eligibleUserIds,
      skipped_user_ids: skippedUserIds,
      total_targeted: user_ids.length,
      total_eligible: eligibleUserIds.length,
      total_skipped: skippedUserIds.length,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
