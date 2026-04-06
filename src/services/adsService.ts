import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { secureUpload } from "@/services/storageUploadService";
import { containsProfanity } from "@/utils/profanityFilter";

export interface Ad {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar: string | null;
  provider_type: string | null;
  provider_city: string | null;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  is_featured: boolean;
  is_verified_provider: boolean;
  views_count: number;
  likes_count: number;
  saves_count: number;
  rejection_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdFilters {
  search?: string;
  specialty?: string;
  city?: string;
  sort?: "newest" | "popular" | "featured";
  limit?: number;
  offset?: number;
}

interface CreateAdInput {
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_type?: string;
  provider_city?: string;
  title: string;
  short_description: string;
  full_description: string;
  image_url: string;
  is_verified_provider?: boolean;
  expires_at?: string;
}

export async function createAd(input: CreateAdInput): Promise<Ad> {
  const text = `${input.title} ${input.short_description} ${input.full_description}`;
  if (containsProfanity(text)) {
    throw new Error("PROFANITY_DETECTED");
  }
  return apiPost<Ad>("/ads", input);
}

export async function updateAd(id: string, updates: Partial<CreateAdInput>): Promise<void> {
  if (updates.title || updates.short_description || updates.full_description) {
    const text = `${updates.title || ""} ${updates.short_description || ""} ${updates.full_description || ""}`;
    if (containsProfanity(text)) {
      throw new Error("PROFANITY_DETECTED");
    }
  }
  await apiPatch(`/ads/${id}`, updates);
}

export async function deleteAd(id: string): Promise<void> {
  await apiDelete(`/ads/${id}`);
}

export async function getApprovedAds(filters: AdFilters = {}): Promise<Ad[]> {
  return apiGet<Ad[]>("/ads", {
    status: "approved",
    search: filters.search,
    specialty: filters.specialty,
    city: filters.city,
    sort: filters.sort,
    limit: filters.limit,
    offset: filters.offset,
  });
}

export async function getProviderAds(providerId: string): Promise<Ad[]> {
  return apiGet<Ad[]>(`/ads/provider/${providerId}`);
}

export async function getAllAds(): Promise<Ad[]> {
  return apiGet<Ad[]>("/ads/all");
}

export async function toggleLike(adId: string, userId: string): Promise<boolean> {
  const res = await apiPost<{ liked: boolean }>(`/ads/${adId}/like`, { user_id: userId });
  return res.liked;
}

export async function toggleSave(adId: string, userId: string): Promise<boolean> {
  const res = await apiPost<{ saved: boolean }>(`/ads/${adId}/save`, { user_id: userId });
  return res.saved;
}

export async function reportAd(adId: string, reporterId: string, reason: string, details?: string): Promise<void> {
  await apiPost(`/ads/${adId}/report`, { reporter_id: reporterId, reason, details });
}

export async function getUserLikes(userId: string): Promise<string[]> {
  return apiGet<string[]>(`/ads/user/${userId}/likes`);
}

export async function getUserSaves(userId: string): Promise<string[]> {
  return apiGet<string[]>(`/ads/user/${userId}/saves`);
}

export async function getSavedAds(userId: string): Promise<Ad[]> {
  return apiGet<Ad[]>(`/ads/user/${userId}/saved-ads`);
}

export async function getLikedAds(userId: string): Promise<Ad[]> {
  return apiGet<Ad[]>(`/ads/user/${userId}/liked-ads`);
}

export async function getAdById(id: string): Promise<Ad> {
  return apiGet<Ad>(`/ads/${id}`);
}

export async function getAdCategories(): Promise<string[]> {
  return apiGet<string[]>(`/ads/categories`);
}

export async function incrementViews(adId: string): Promise<void> {
  await apiPost(`/ads/${adId}/view`, {});
}

export async function adminApprove(adId: string): Promise<void> {
  await apiPatch(`/ads/${adId}/status`, { status: "approved" });
}

export async function adminReject(adId: string, reason: string): Promise<void> {
  await apiPatch(`/ads/${adId}/status`, { status: "rejected", rejection_reason: reason });
}

export async function adminSuspend(adId: string): Promise<void> {
  await apiPatch(`/ads/${adId}/status`, { status: "suspended" });
}

export async function adminToggleFeatured(adId: string, featured: boolean): Promise<void> {
  await apiPatch(`/ads/${adId}/featured`, { is_featured: featured });
}

export async function getAdReports(): Promise<any[]> {
  return apiGet<any[]>("/ads/reports");
}

export async function resolveReport(reportId: string): Promise<void> {
  await apiPatch(`/ads/reports/${reportId}/resolve`, {});
}

export async function uploadAdImage(file: File, providerId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${providerId}/ads/${Date.now()}.${ext}`;
  return secureUpload("provider-images", path, file, true);
}
