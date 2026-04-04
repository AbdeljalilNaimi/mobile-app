import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

export interface BloodEmergency {
  id: string;
  provider_id: string;
  provider_name: string | null;
  provider_lat: number | null;
  provider_lng: number | null;
  blood_type_needed: string;
  urgency_level: string;
  status: string;
  responders_count: number;
  message: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface BloodEmergencyResponse {
  id: string;
  emergency_id: string;
  citizen_id: string;
  citizen_name: string | null;
  citizen_phone: string | null;
  status: string;
  created_at: string;
}

export interface DonationRecord {
  id: string;
  citizen_id: string;
  provider_id: string;
  provider_name: string | null;
  blood_type: string;
  donated_at: string;
  emergency_id: string | null;
  notes: string | null;
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export async function broadcastEmergency(data: {
  provider_id: string;
  provider_name?: string;
  provider_lat?: number;
  provider_lng?: number;
  blood_type_needed: string;
  urgency_level: string;
  message?: string;
}): Promise<BloodEmergency> {
  return apiPost("/blood-emergency", data);
}

export async function resolveEmergency(emergencyId: string): Promise<void> {
  await apiPatch("/blood-emergency/" + emergencyId + "/resolve");
}

export async function getActiveEmergencies(): Promise<BloodEmergency[]> {
  return apiGet("/blood-emergency/active");
}

export async function getEmergenciesByProvider(providerId: string): Promise<BloodEmergency[]> {
  return apiGet("/blood-emergency/provider/" + providerId);
}

export async function respondToEmergency(emergencyId: string, citizenData: {
  citizen_id: string;
  citizen_name?: string;
  citizen_phone?: string;
}): Promise<BloodEmergencyResponse> {
  return apiPost("/blood-emergency/" + emergencyId + "/respond", citizenData);
}

export async function cancelResponse(responseId: string): Promise<void> {
  await apiDelete("/blood-emergency/responses/" + responseId);
}

export async function getResponsesForEmergency(emergencyId: string): Promise<BloodEmergencyResponse[]> {
  return apiGet("/blood-emergency/" + emergencyId + "/responses");
}

export async function addDonation(data: {
  citizen_id: string;
  provider_id: string;
  provider_name?: string;
  blood_type: string;
  emergency_id?: string;
  notes?: string;
}): Promise<DonationRecord> {
  return apiPost("/blood-emergency/donations", data);
}

export async function getDonationHistory(citizenId: string): Promise<DonationRecord[]> {
  return apiGet("/blood-emergency/donations/" + citizenId);
}

// Polling-based subscription (replaces Supabase realtime)
export function subscribeToEmergencies(callback: (emergencies: BloodEmergency[]) => void) {
  getActiveEmergencies().then(callback);
  const interval = setInterval(() => {
    getActiveEmergencies().then(callback).catch(console.error);
  }, 15000);
  return () => clearInterval(interval);
}

export function subscribeToResponses(emergencyId: string, callback: (responses: BloodEmergencyResponse[]) => void) {
  getResponsesForEmergency(emergencyId).then(callback);
  const interval = setInterval(() => {
    getResponsesForEmergency(emergencyId).then(callback).catch(console.error);
  }, 10000);
  return () => clearInterval(interval);
}

async function apiPatch(path: string, body?: unknown): Promise<unknown> {
  const res = await fetch("/api" + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
