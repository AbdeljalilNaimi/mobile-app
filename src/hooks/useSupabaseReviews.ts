import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

export interface SupabaseReview {
  id: string;
  provider_id: string;
  patient_id: string;
  patient_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

function computeStats(reviews: SupabaseReview[]): ReviewStats {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
    sum += r.rating;
  }
  return {
    averageRating: reviews.length > 0 ? sum / reviews.length : 0,
    totalReviews: reviews.length,
    ratingDistribution: dist as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

export function useSupabaseReviews(providerId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["provider-reviews", providerId];

  const { data: reviews = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!providerId) return [];
      return apiGet<SupabaseReview[]>("/reviews/" + providerId);
    },
    enabled: !!providerId,
  });

  const stats = computeStats(reviews);

  const submitReview = useMutation({
    mutationFn: async (input: { patientId: string; patientName: string; rating: number; comment: string }) => {
      return apiPost("/reviews", {
        provider_id: providerId!,
        patient_id: input.patientId,
        patient_name: input.patientName,
        rating: input.rating,
        comment: input.comment,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => apiDelete("/reviews/" + reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { reviews, stats, isLoading, submitReview, deleteReview };
}

export function usePatientSupabaseReviews(patientId: string | undefined) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["patient-reviews", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return apiGet<SupabaseReview[]>(`/reviews/patient/${patientId}`);
    },
    enabled: !!patientId,
  });
  return { data: reviews, isLoading };
}
