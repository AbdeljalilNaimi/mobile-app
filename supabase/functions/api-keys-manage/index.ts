import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Verify Firebase ID token using Google's public token info endpoint
async function verifyFirebaseToken(idToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    if (!res.ok) return null;
    const payload = await res.json();
    // Verify the audience matches our Firebase project
    const projectId = Deno.env.get("VITE_FIREBASE_PROJECT_ID");
    if (payload.aud !== projectId && payload.azp !== projectId) {
      return null;
    }
    return payload.sub; // Firebase UID
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idToken = authHeader.replace("Bearer ", "");
    const userId = await verifyFirebaseToken(idToken);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client since anon can no longer write
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action } = body;

    let result;

    switch (action) {
      case "create": {
        const { key_hash, key_suffix, app_name, app_description } = body;
        const { data, error } = await supabaseAdmin
          .from("api_keys")
          .insert({
            developer_id: userId,
            key_hash,
            key_suffix,
            app_name,
            app_description,
            plan: "free",
            rate_limit_per_day: 100,
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "deactivate": {
        const { key_id } = body;
        const { error } = await supabaseAdmin
          .from("api_keys")
          .update({ is_active: false })
          .eq("id", key_id)
          .eq("developer_id", userId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "regenerate": {
        const { key_id, key_hash, key_suffix } = body;
        const { error } = await supabaseAdmin
          .from("api_keys")
          .update({ key_hash, key_suffix, is_active: true })
          .eq("id", key_id)
          .eq("developer_id", userId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
