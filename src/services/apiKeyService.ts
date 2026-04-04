import { apiGet, apiPost, apiPatch } from "@/lib/apiClient";
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

async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateApiKey(
  developerId: string,
  appName: string,
  appDescription: string
): Promise<{ rawKey: string; apiKey: ApiKey }> {
  const rawKey = "ch_live_" + crypto.randomUUID().replace(/-/g, "");
  const keyHash = await hashKey(rawKey);
  const keySuffix = "ch_live_****" + rawKey.slice(-4);
  const apiKey = await apiPost<ApiKey>("/api-keys", {
    developer_id: developerId,
    key_hash: keyHash,
    key_suffix: keySuffix,
    app_name: appName,
    app_description: appDescription,
  }, true);
  return { rawKey, apiKey };
}

export async function getApiKeys(developerId: string): Promise<ApiKey[]> {
  return apiGet("/api-keys/" + developerId);
}

export async function deactivateApiKey(keyId: string, _developerId: string): Promise<void> {
  await apiPatch("/api-keys/" + keyId + "/deactivate", {}, true);
}

export async function regenerateApiKey(keyId: string, _developerId: string): Promise<{ rawKey: string }> {
  const rawKey = "ch_live_" + crypto.randomUUID().replace(/-/g, "");
  const keyHash = await hashKey(rawKey);
  const keySuffix = "ch_live_****" + rawKey.slice(-4);
  await apiPatch("/api-keys/" + keyId + "/regenerate", { key_hash: keyHash, key_suffix: keySuffix }, true);
  return { rawKey };
}

export async function getKeyUsage(apiKeyId: string): Promise<ApiUsage[]> {
  return apiGet("/api-keys/" + apiKeyId + "/usage");
}

export async function getKeyLogs(apiKeyId: string, limit = 50): Promise<ApiLog[]> {
  return apiGet("/api-keys/" + apiKeyId + "/logs", { limit });
}

export async function getAllApiKeys(): Promise<ApiKey[]> {
  return apiGet("/api-keys");
}

export async function getGlobalUsageStats() {
  return apiGet("/api-keys/global/usage");
}

export async function getAllLogs(limit = 100): Promise<ApiLog[]> {
  return apiGet("/api-keys/global/logs", { limit });
}

export async function getTodayUsage(apiKeyId: string): Promise<number> {
  try {
    const usage = await getKeyUsage(apiKeyId);
    const today = new Date().toISOString().slice(0, 10);
    return usage.filter((u: ApiUsage) => u.date?.startsWith?.(today)).reduce((sum: number, u: ApiUsage) => sum + (u.count || 0), 0);
  } catch {
    return 0;
  }
}
