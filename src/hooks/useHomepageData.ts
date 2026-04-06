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
    queryFn: async () => {
      const data = await apiGet<HomepageArticle[]>("/homepage/articles");
      cacheService.saveHomepageArticles(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: () => cacheService.loadHomepageArticles() ?? undefined,
  });
}

export function useHomepageCommunity() {
  return useQuery({
    queryKey: ["homepage-community"],
    queryFn: async () => {
      const data = await apiGet<HomepageCommunityPost[]>("/homepage/community");
      cacheService.saveHomepageCommunity(data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: () => cacheService.loadHomepageCommunity() ?? undefined,
  });
}
