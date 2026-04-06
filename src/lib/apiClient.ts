import { auth } from "@/lib/firebase";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "") + "/api";

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) searchParams.set(k, String(v));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body?: unknown, authRequired = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authRequired) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body?: unknown, authRequired = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authRequired) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string, body?: unknown, authRequired = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authRequired) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiUpload(path: string, formData: FormData, authRequired = true): Promise<{ publicUrl: string; filename: string }> {
  const headers: Record<string, string> = {};
  if (authRequired) {
    const authHeaders = await getAuthHeader();
    Object.assign(headers, authHeaders);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
