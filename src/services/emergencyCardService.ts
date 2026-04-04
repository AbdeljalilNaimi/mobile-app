import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export interface EmergencyHealthCard {
  id?: string;
  user_id: string;
  blood_group: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  vaccination_history: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_public_for_emergencies: boolean;
  share_token: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getEmergencyCard(userId: string): Promise<EmergencyHealthCard | null> {
  try {
    return await apiGet<EmergencyHealthCard | null>("/emergency-card/" + userId);
  } catch {
    return null;
  }
}

export async function getEmergencyCardByToken(token: string): Promise<EmergencyHealthCard | null> {
  try {
    return await apiGet<EmergencyHealthCard | null>("/emergency-card/token/" + token);
  } catch {
    return null;
  }
}

export async function upsertEmergencyCard(card: EmergencyHealthCard): Promise<EmergencyHealthCard> {
  return apiPut<EmergencyHealthCard>("/emergency-card/" + card.user_id, card);
}

export async function deleteEmergencyCard(userId: string): Promise<void> {
  await apiDelete("/emergency-card/" + userId);
}

export interface CardConsultationLog {
  id: string;
  card_id: string;
  card_user_id: string;
  provider_uid: string;
  provider_name: string | null;
  provider_type: string | null;
  scanned_at: string;
}

export async function logCardConsultation(
  cardId: string,
  cardUserId: string,
  providerUid: string,
  providerName: string | null,
  providerType: string | null
): Promise<void> {
  try {
    await apiPost("/emergency-card/log-scan", {
      card_id: cardId,
      card_user_id: cardUserId,
      provider_uid: providerUid,
      provider_name: providerName,
      provider_type: providerType,
    });
  } catch (err) {
    console.error("Error logging consultation:", err);
  }
}

export async function getCardConsultationLogs(userId: string): Promise<CardConsultationLog[]> {
  try {
    return await apiGet<CardConsultationLog[]>("/emergency-card/" + userId + "/scan-logs");
  } catch {
    return [];
  }
}

export async function getConsultationHistory(userId: string): Promise<CardConsultationLog[]> {
  return getCardConsultationLogs(userId);
}
