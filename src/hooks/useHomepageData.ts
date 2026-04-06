import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { cacheService } from "@/services/cacheService";

export interface HomepageAd {
  id: string;
  title: string;
  short_description: string;
  provider_name: string;
  provider_id: string;
  is_featured: boolean;
  is_verified_provider: boolean;
  image_url: string;
  provider_avatar: string | null;
  status: string;
}

export interface HomepageArticle {
  id: string;
  title: string;
  provider_name: string;
  views_count: number;
  status: string;
}

export interface HomepageCommunityPost {
  id: string;
  title: string;
  category: string;
  comments_count: number;
}

export function useHomepageAds() {
  return useQuery({
    queryKey: ["homepage-ads"],
    queryFn: async () => {
      const data = await apiGet<HomepageAd[]>("/homepage/ads");
      cacheService.saveHomepageAds(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: () => cacheService.loadHomepageAds() ?? undefined,
  });
}

export function useHomepageArticles() {
  return useQuery({
    queryKey: ["homepage-articles"],
    queryFn: () => apiGet<HomepageArticle[]>("/homepage/articles"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageCommunity() {
  return useQuery({
    queryKey: ["homepage-community"],
    queryFn: () => apiGet<HomepageCommunityPost[]>("/homepage/community"),
    staleTime: 5 * 60 * 1000,
  });
}
