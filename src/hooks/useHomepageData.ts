import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHomepageAds() {
  return useQuery({
    queryKey: ['homepage-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, short_description, provider_name, is_featured, is_verified_provider, image_url, provider_avatar, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageArticles() {
  return useQuery({
    queryKey: ['homepage-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_articles')
        .select('id, title, provider_name, views_count, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(2);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomepageCommunity() {
  return useQuery({
    queryKey: ['homepage-community'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, title, category, comments_count')
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

