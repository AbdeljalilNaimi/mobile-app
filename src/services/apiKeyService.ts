import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

export interface ApiKey {
  id: string;
  developer_id: string;
  key_suffix: string;
  app_name: string | null;
  app_description: string | null;
  plan: string;
  rate_limit_per_day: number;
  is_active: boolean;
  created_at: string;
}

export interface ApiUsage {
  date: string;
  request_count: number;
  endpoint: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number | null;
  created_at: string;
}

// SHA-256 hash in browser
async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Get Firebase ID token for authenticated requests
async function getFirebaseToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

// Call the api-keys-manage edge function
async function callEdgeFunction(body: Record<string, unknown>): Promise<unknown> {
  const token = await getFirebaseToken();
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/api-keys-manage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Edge function error");
  }
  return res.json();
}

// Generate a new API key (via edge function)
export async function generateApiKey(
  developerId: string,
  appName: string,
  appDescription: string
): Promise<{ rawKey: string; apiKey: ApiKey }> {
  const rawKey = `ch_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashKey(rawKey);
  const keySuffix = `ch_live_****${rawKey.slice(-4)}`;

  const data = await callEdgeFunction({
    action: "create",
    key_hash: keyHash,
    key_suffix: keySuffix,
    app_name: appName,
    app_description: appDescription,
  });

  return { rawKey, apiKey: data as ApiKey };
}

// Get developer's API keys (read-only, still uses anon client)
export async function getApiKeys(developerId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("developer_id", developerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ApiKey[];
}

// Deactivate an API key (via edge function)
export async function deactivateApiKey(keyId: string, _developerId: string): Promise<void> {
  await callEdgeFunction({
    action: "deactivate",
    key_id: keyId,
  });
}

// Regenerate an API key (via edge function)
export async function regenerateApiKey(keyId: string, _developerId: string): Promise<{ rawKey: string }> {
  const rawKey = `ch_live_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await hashKey(rawKey);
  const keySuffix = `ch_live_****${rawKey.slice(-4)}`;

  await callEdgeFunction({
    action: "regenerate",
    key_id: keyId,
    key_hash: keyHash,
    key_suffix: keySuffix,
  });

  return { rawKey };
}

// Get usage for a key (last 7 days) — read-only
export async function getKeyUsage(apiKeyId: string): Promise<ApiUsage[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("api_usage")
    .select("date, request_count, endpoint")
    .eq("api_key_id", apiKeyId)
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return (data || []) as ApiUsage[];
}

// Get today's total usage for a key — read-only
export async function getTodayUsage(apiKeyId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("api_usage")
    .select("request_count")
    .eq("api_key_id", apiKeyId)
    .eq("date", today);

  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + (r.request_count || 0), 0);
}

// Get recent logs for a key — read-only
export async function getKeyLogs(apiKeyId: string, limit = 50): Promise<ApiLog[]> {
  const { data, error } = await supabase
    .from("api_logs")
    .select("*")
    .eq("api_key_id", apiKeyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ApiLog[];
}

// ===== ADMIN FUNCTIONS =====

// Get all API keys (admin)
export async function getAllApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ApiKey[];
}

// Get global usage stats (admin)
export async function getGlobalUsageStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("api_usage")
    .select("date, request_count, endpoint")
    .gte("date", sevenDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get recent logs (admin)
export async function getAllLogs(limit = 100): Promise<ApiLog[]> {
  const { data, error } = await supabase
    .from("api_logs")
    .select("*, api_keys(key_suffix, app_name, developer_id)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ApiLog[];
}
