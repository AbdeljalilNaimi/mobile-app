import React, { useState } from 'react';
import { Star, ThumbsUp, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { SupabaseReview, ReviewStats } from '@/hooks/useSupabaseReviews';
import type { UseMutationResult } from '@tanstack/react-query';

interface ReviewSystemProps {
  providerId: string;
  providerName: string;
  canReview?: boolean;
  reviews: SupabaseReview[];
  stats: ReviewStats;
  isLoading: boolean;
  submitReview: UseMutationResult<void, Error, { patientId: string; patientName: string; rating: number; comment: string }>;
  currentUserId?: string;
  currentUserName?: string;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  providerId,
  providerName,
  canReview = false,
  reviews,
  stats,
  isLoading,
  submitReview,
  currentUserId,
  currentUserName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = () => {
    if (!rating || !comment.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (!currentUserId) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }
    const name = currentUserName || 'Patient';

    submitReview.mutate(
      { patientId: currentUserId, patientName: name, rating, comment },
      {
        onSuccess: () => {
          toast.success('Votre avis a été publié avec succès!');
          setRating(0);
          setComment('');
          setDialogOpen(false);
        },
        onError: () => {
          toast.error("Erreur lors de la publication de l'avis");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 shrink-0" />
            Avis des patients
          </CardTitle>
          {canReview && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs sm:text-sm shrink-0">Laisser un avis</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-base">Laisser un avis pour {providerName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre note</label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-8 w-8 sm:h-9 sm:w-9 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Votre commentaire</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} disabled={submitReview.isPending} className="flex-1 sm:flex-none">
                      {submitReview.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Publier
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-6">
        {/* Overall Stats */}
        <div className="rounded-xl bg-muted/30 p-4">
          {/* Mobile: horizontal compact layout */}
          <div className="flex items-center gap-4 sm:hidden">
            <div className="shrink-0 text-center">
              <div className="text-4xl font-bold text-primary leading-none">{stats.averageRating.toFixed(1)}</div>
              <div className="flex gap-0.5 mt-1.5 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{stats.totalReviews} avis</p>
            </div>

            <Separator orientation="vertical" className="h-16" />

            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((ratingLevel) => (
                <div key={ratingLevel} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-muted-foreground">{ratingLevel}</span>
                  <Progress
                    value={stats.totalReviews > 0 ? (stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}
                    className="flex-1 h-1.5"
                  />
                  <span className="w-5 text-muted-foreground text-right text-[11px]">
                    {stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: original layout */}
          <div className="hidden sm:flex gap-6">
            <div className="text-center border-r pr-6">
              <div className="text-5xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
              <div className="flex gap-0.5 mt-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Basé sur {stats.totalReviews} avis
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((ratingLevel) => (
                <div key={ratingLevel} className="flex items-center gap-3 text-sm">
                  <span className="w-12 flex items-center gap-1">
                    {ratingLevel} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <Progress
                    value={stats.totalReviews > 0 ? (stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}
                    className="flex-1 h-2"
                  />
                  <span className="w-12 text-muted-foreground text-right">
                    {stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <Separator />

        {reviews.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground px-4">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience !
            </p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {reviews.map((review) => (
              <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {review.patient_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{review.patient_name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
