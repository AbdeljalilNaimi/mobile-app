import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";

export function useHomepageAds() {
  return useQuery({
    queryKey: ["homepage-ads"],
    queryFn: () => apiGet<any[]>("/homepage/ads"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageArticles() {
  return useQuery({
    queryKey: ["homepage-articles"],
    queryFn: () => apiGet<any[]>("/homepage/articles"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageCommunity() {
  return useQuery({
    queryKey: ["homepage-community"],
    queryFn: () => apiGet<any[]>("/homepage/community"),
    staleTime: 5 * 60 * 1000,
  });
}
