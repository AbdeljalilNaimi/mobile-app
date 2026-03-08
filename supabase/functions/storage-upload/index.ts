import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function verifyFirebaseToken(
  token: string
): Promise<{ uid: string } | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    if (!res.ok) {
      // Try as access-token style via userinfo
      const res2 = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res2.ok) return null;
      const info = await res2.json();
      return info.sub ? { uid: info.sub } : null;
    }
    const payload = await res.json();
    const projectId = Deno.env.get("VITE_FIREBASE_PROJECT_ID");
    if (
      projectId &&
      payload.aud !== projectId &&
      payload.azp !== projectId
    ) {
      return null;
    }
    return payload.sub ? { uid: payload.sub } : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const firebaseUser = await verifyFirebaseToken(token);
    if (!firebaseUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const filePath = formData.get("path") as string | null;
    const upsertStr = formData.get("upsert") as string | null;
    const action = formData.get("action") as string | null;

    // Allowed buckets
    const ALLOWED_BUCKETS = ["provider-images", "pdfs", "provider-catalogs"];
    if (bucket && !ALLOWED_BUCKETS.includes(bucket)) {
      return new Response(
        JSON.stringify({ error: "Bucket not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // DELETE action
    if (action === "delete") {
      const paths = formData.get("paths") as string | null;
      if (!bucket || !paths) {
        return new Response(
          JSON.stringify({ error: "Missing bucket or paths" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const pathList = JSON.parse(paths) as string[];
      const { error } = await supabase.storage.from(bucket).remove(pathList);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UPLOAD action (default)
    if (!file || !bucket || !filePath) {
      return new Response(
        JSON.stringify({ error: "Missing file, bucket, or path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Size limit: 20MB
    if (file.size > 20 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 20MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: upsertStr === "true",
      contentType: file.type,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ publicUrl: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
