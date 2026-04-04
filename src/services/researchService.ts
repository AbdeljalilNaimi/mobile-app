import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { secureUpload } from "@/services/storageUploadService";
import { containsProfanity } from "@/utils/profanityFilter";

export interface ResearchArticle {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar: string | null;
  provider_type: string | null;
  provider_city: string | null;
  title: string;
  abstract: string;
  content: string;
  category: string;
  tags: string[];
  doi: string | null;
  pdf_url: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  is_featured: boolean;
  is_verified_provider: boolean;
  views_count: number;
  reactions_count: number;
  saves_count: number;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFilters {
  search?: string;
  category?: string;
  sort?: "newest" | "popular" | "featured";
  limit?: number;
  offset?: number;
}

interface CreateArticleInput {
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_type?: string;
  provider_city?: string;
  title: string;
  abstract: string;
  content: string;
  category: string;
  tags?: string[];
  doi?: string;
  pdf_url?: string;
  is_verified_provider?: boolean;
}

export async function createArticle(input: CreateArticleInput): Promise<ResearchArticle> {
  const text = `${input.title} ${input.abstract} ${input.content}`;
  if (containsProfanity(text)) {
    throw new Error("PROFANITY_DETECTED");
  }
  return apiPost<ResearchArticle>("/research/articles", input);
}

export async function updateArticle(id: string, updates: Partial<CreateArticleInput>): Promise<void> {
  if (updates.title || updates.abstract || updates.content) {
    const text = `${updates.title || ""} ${updates.abstract || ""} ${updates.content || ""}`;
    if (containsProfanity(text)) {
      throw new Error("PROFANITY_DETECTED");
    }
  }
  await apiPatch(`/research/articles/${id}`, updates);
}

export async function deleteArticle(id: string): Promise<void> {
  await apiDelete(`/research/articles/${id}`);
}

export async function getApprovedArticles(filters: ArticleFilters = {}): Promise<ResearchArticle[]> {
  return apiGet<ResearchArticle[]>("/research/articles", {
    search: filters.search,
    category: filters.category,
    sort: filters.sort,
    limit: filters.limit,
    offset: filters.offset,
  });
}

export async function getFeaturedArticles(limit = 5): Promise<ResearchArticle[]> {
  return apiGet<ResearchArticle[]>("/research/articles/featured", { limit });
}

export async function getArticleById(id: string): Promise<ResearchArticle | null> {
  try {
    return await apiGet<ResearchArticle>(`/research/articles/${id}`);
  } catch {
    return null;
  }
}

export async function getProviderArticles(providerId: string): Promise<ResearchArticle[]> {
  return apiGet<ResearchArticle[]>(`/research/articles/provider/${providerId}`);
}

export async function getAllArticles(): Promise<ResearchArticle[]> {
  return apiGet<ResearchArticle[]>("/research/articles/all");
}

export async function toggleReaction(articleId: string, userId: string): Promise<boolean> {
  const res = await apiPost<{ reacted: boolean }>(`/research/articles/${articleId}/react`, { user_id: userId });
  return res.reacted;
}

export async function toggleSave(articleId: string, userId: string): Promise<boolean> {
  const res = await apiPost<{ saved: boolean }>(`/research/articles/${articleId}/save`, { user_id: userId });
  return res.saved;
}

export async function recordView(articleId: string, viewerId?: string): Promise<void> {
  await apiPost(`/research/articles/${articleId}/view`, { viewer_id: viewerId || null });
}

export async function getUserReactions(userId: string): Promise<string[]> {
  return apiGet<string[]>(`/research/articles/user/${userId}/reactions`);
}

export async function getUserSaves(userId: string): Promise<string[]> {
  return apiGet<string[]>(`/research/articles/user/${userId}/saves`);
}

export async function getSavedArticles(userId: string): Promise<ResearchArticle[]> {
  return apiGet<ResearchArticle[]>(`/research/articles/user/${userId}/saved`);
}

export async function adminApprove(articleId: string): Promise<void> {
  await apiPatch(`/research/articles/${articleId}/status`, { status: "approved" });
}

export async function adminReject(articleId: string, reason: string): Promise<void> {
  await apiPatch(`/research/articles/${articleId}/status`, { status: "rejected", rejection_reason: reason });
}

export async function adminSuspend(articleId: string): Promise<void> {
  await apiPatch(`/research/articles/${articleId}/status`, { status: "suspended" });
}

export async function adminToggleFeatured(articleId: string, featured: boolean): Promise<void> {
  await apiPatch(`/research/articles/${articleId}/featured`, { is_featured: featured });
}

export async function uploadArticlePdf(file: File, providerId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${providerId}/research/${Date.now()}.${ext}`;
  return secureUpload("pdfs", path, file, true);
}

export const RESEARCH_CATEGORIES = [
  "Cardiologie",
  "Pédiatrie",
  "Neurologie",
  "Oncologie",
  "Ophtalmologie",
  "Dermatologie",
  "Chirurgie",
  "Médecine interne",
  "Santé publique",
  "Recherche clinique",
  "Pharmacologie",
  "Radiologie",
  "Biologie médicale",
  "Médecine générale",
  "Gynécologie",
  "Urologie",
  "ORL",
  "Psychiatrie",
  "Autre",
];
