/**
 * TanStack Query hooks for provider data
 *
 * Use these hooks for all Firestore provider reads.
 * Benefits: automatic caching, background refetching, loading states.
 *
 * Cache strategy: stale-while-revalidate via TanStack Query + localStorage TTL cache.
 * - On mount: placeholder data shown instantly from localStorage (if available & fresh).
 * - Background: Firestore fetch refreshes the data and updates the localStorage cache.
 * - Offline: Firestore SDK serves data from IndexedDB; TQ shows localStorage placeholder.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVerifiedProviders,
  getAllProviders,
  getProviderById,
  getProvidersByType,
  getEmergencyProviders,
  getBloodCenters,
  searchProviders,
  getPendingProviders,
  getProviderByUserId,
  updateProviderVerification,
  updateProvider,
} from '@/services/firestoreProviderService';
import { cacheService } from '@/services/cacheService';
import { ProviderType, CityHealthProvider } from '@/data/providers';

// Query keys for cache management
export const providerKeys = {
  all: ['providers'] as const,
  verified: () => [...providerKeys.all, 'verified'] as const,
  pending: () => [...providerKeys.all, 'pending'] as const,
  detail: (id: string) => [...providerKeys.all, 'detail', id] as const,
  byType: (type: ProviderType) => [...providerKeys.all, 'type', type] as const,
  byUser: (userId: string) => [...providerKeys.all, 'user', userId] as const,
  emergency: () => [...providerKeys.all, 'emergency'] as const,
  bloodCenters: () => [...providerKeys.all, 'bloodCenters'] as const,
  search: (query: string) => [...providerKeys.all, 'search', query] as const,
};

/**
 * Fetch all verified and public providers
 * Use for: search page, map view, public listings
 */
export function useVerifiedProviders() {
  return useQuery({
    queryKey: providerKeys.verified(),
    queryFn: async () => {
      const data = await getVerifiedProviders();
      cacheService.saveProviders(data);
      return data;
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    placeholderData: () => cacheService.loadProviders() ?? undefined,
  });
}

/**
 * Fetch all providers (admin only)
 * Use for: admin dashboard
 */
export function useAllProviders() {
  return useQuery({
    queryKey: providerKeys.all,
    queryFn: getAllProviders,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch pending providers (admin only)
 * Use for: admin verification queue
 */
export function usePendingProviders() {
  return useQuery({
    queryKey: providerKeys.pending(),
    queryFn: getPendingProviders,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Fetch a single provider by ID
 * Use for: provider profile page
 */
export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: providerKeys.detail(id || ''),
    queryFn: () => getProviderById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch providers by type
 * Use for: filtered search results
 */
export function useProvidersByType(type: ProviderType) {
  return useQuery({
    queryKey: providerKeys.byType(type),
    queryFn: () => getProvidersByType(type),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch provider by user ID
 * Use for: provider dashboard
 */
export function useProviderByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: providerKeys.byUser(userId || ''),
    queryFn: () => getProviderByUserId(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch emergency providers
 * Use for: emergency services page, map emergency mode
 */
export function useEmergencyProviders() {
  return useQuery({
    queryKey: providerKeys.emergency(),
    queryFn: async () => {
      const data = await getEmergencyProviders();
      cacheService.saveEmergencyProviders(data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    placeholderData: () => cacheService.loadEmergencyProviders() ?? undefined,
  });
}

/**
 * Fetch blood donation centers
 * Use for: blood donation page, map blood mode
 */
export function useBloodCenters() {
  return useQuery({
    queryKey: providerKeys.bloodCenters(),
    queryFn: getBloodCenters,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Search providers by query
 * Use for: search with text input
 */
export function useSearchProviders(query: string) {
  return useQuery({
    queryKey: providerKeys.search(query),
    queryFn: () => searchProviders(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch premium providers (planType === 'premium') from verified providers
 * Use for: homepage "Meilleurs praticiens" section
 */
export function usePremiumProviders() {
  const result = useQuery({
    queryKey: [...providerKeys.verified(), 'premium'] as const,
    queryFn: async () => {
      const data = await getVerifiedProviders();
      cacheService.saveProviders(data);
      return data;
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    placeholderData: () => cacheService.loadProviders() ?? undefined,
  });

  const premiumProviders = result.data
    ? result.data.filter(p => p.planType === 'premium')
    : [];

  const topProviders = [...premiumProviders]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return {
    ...result,
    data: topProviders,
    hasPremium: premiumProviders.length > 0,
  };
}

/**
 * Mutation: Update provider verification status
 * Use for: admin approval/rejection
 */
export function useUpdateVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      status,
      isPublic,
    }: {
      providerId: string;
      status: 'pending' | 'verified' | 'rejected';
      isPublic: boolean;
    }) => updateProviderVerification(providerId, status, isPublic),
    onSuccess: () => {
      cacheService.invalidateProviders();
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
    },
  });
}

/**
 * Mutation: Update provider profile data
 * Use for: provider dashboard profile updates
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      updates,
    }: {
      providerId: string;
      updates: Partial<CityHealthProvider>;
    }) => updateProvider(providerId, updates),
    onSuccess: (_, { providerId }) => {
      cacheService.invalidateProviders();
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(providerId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.verified() });
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      queryClient.invalidateQueries({ predicate: (query) =>
        query.queryKey[0] === 'providers' && query.queryKey[1] === 'user'
      });
    },
  });
}

/**
 * Mutation: Update provider with verification check
 * Use for: sensitive field updates that may revoke verification
 */
export function useUpdateProviderWithVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      updates,
      currentVerificationStatus,
    }: {
      providerId: string;
      updates: Partial<CityHealthProvider>;
      currentVerificationStatus: 'pending' | 'verified' | 'rejected';
    }) => {
      const { updateProviderWithVerificationCheck } = await import(
        '@/services/firestoreProviderService'
      );
      return updateProviderWithVerificationCheck(providerId, updates, currentVerificationStatus);
    },
    onSuccess: (result, { providerId }) => {
      cacheService.invalidateProviders();
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(providerId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.verified() });
      queryClient.invalidateQueries({ queryKey: providerKeys.pending() });
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      return result;
    },
  });
}
