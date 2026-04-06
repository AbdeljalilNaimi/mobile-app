import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, TrendingUp, Clock, Star, Loader2, Megaphone, CheckCircle2, Flag } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullIndicator } from '@/components/PullIndicator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdCard } from '@/components/ads/AdCard';
import { AdsPageHero } from '@/components/ads/AdsPageHero';
import { AdsCategoryBar } from '@/components/ads/AdsCategoryBar';
import { LikedAdsDrawer } from '@/components/ads/LikedAdsDrawer';
import { Ad, getApprovedAds, getUserLikes, getUserSaves, reportAd, AdFilters } from '@/services/adsService';
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Récentes', icon: Clock },
  { value: 'popular' as const, label: 'Populaires', icon: TrendingUp },
  { value: 'featured' as const, label: 'Sponsorisées', icon: Star },
];

export default function AdsPage() {
  const { user } = useAuth();

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<AdFilters['sort']>('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedDrawerOpen, setLikedDrawerOpen] = useState(false);

  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userSaves, setUserSaves] = useState<string[]>([]);

  const [reportAdId, setReportAdId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (currentOffset: number, replace: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const result = await getApprovedAds({
        search: search || undefined,
        specialty: selectedCategory || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: currentOffset,
      });
      setAds(prev => replace ? result : [...prev, ...result]);
      setHasMore(result.length >= PAGE_SIZE);
      setOffset(currentOffset + result.length);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      if (replace) setLoading(false); else setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [search, sort, selectedCategory]);

  useEffect(() => {
    setAds([]);
    setOffset(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [search, sort, selectedCategory]);

  const handleRefresh = useCallback(async () => {
    isFetchingRef.current = false;
    setAds([]);
    setOffset(0);
    setHasMore(true);
    await fetchPage(0, true);
  }, [fetchPage]);

  const { ref: pullRef, pullDistance, isRefreshing } = usePullToRefresh<HTMLDivElement>({ onRefresh: handleRefresh });

  useEffect(() => {
    if (user?.uid) {
      getUserLikes(user.uid).then(setUserLikes).catch(() => {});
      getUserSaves(user.uid).then(setUserSaves).catch(() => {});
    }
  }, [user?.uid]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(offset, false);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, offset, fetchPage]);

  const handleLikeToggle = (adId: string, liked: boolean) => {
    setUserLikes(prev => liked ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  const handleSaveToggle = (adId: string, saved: boolean) => {
    setUserSaves(prev => saved ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  const handleReportOpen = (adId: string) => {
    if (!user) { toast.info('Connectez-vous pour signaler une annonce'); return; }
    setReportAdId(adId);
    setReportReason('');
    setReportDetails('');
  };

  const handleReportSubmit = async () => {
    if (!user || !reportAdId) return;
    if (!reportReason) { toast.error('Veuillez sélectionner une raison'); return; }
    setReporting(true);
    try {
      await reportAd(reportAdId, user.uid, reportReason, reportDetails);
      toast.success('Signalement envoyé, merci.');
      setReportAdId(null);
    } catch {
      toast.error('Erreur lors du signalement');
    } finally {
      setReporting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Annonces Pro - CityHealth Sidi Bel Abbès</title>
        <meta name="description" content="Découvrez les annonces et offres de nos professionnels de santé vérifiés à Sidi Bel Abbès." />
      </Helmet>

      <PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      <div ref={pullRef} className="min-h-screen bg-muted/30">
        {/* Hero */}
        <AdsPageHero onOpenLikedDrawer={() => setLikedDrawerOpen(true)} />

        {/* Search + Sort bar */}
        <div className="bg-background border-b px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-search-ads"
                placeholder="Rechercher..."
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  data-testid={`button-sort-${opt.value}`}
                  variant={sort === opt.value ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1 h-9 px-3"
                  onClick={() => setSort(opt.value)}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">{opt.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="bg-background border-b">
          <AdsCategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Ads grid */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Aucune annonce</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {selectedCategory
                  ? `Aucune annonce dans la catégorie "${selectedCategory}".`
                  : 'Les annonces approuvées apparaîtront ici.'}
              </p>
              {selectedCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSelectedCategory(null)}
                >
                  Voir toutes les annonces
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {ads.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    userId={user?.uid}
                    isLiked={userLikes.includes(ad.id)}
                    isSaved={userSaves.includes(ad.id)}
                    onLikeToggle={handleLikeToggle}
                    onSaveToggle={handleSaveToggle}
                    onReport={handleReportOpen}
                  />
                ))}
              </div>

              <div
                ref={sentinelRef}
                data-testid="sentinel-load-more"
                className="flex items-center justify-center py-10 mt-4"
              >
                {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                {!hasMore && !loadingMore && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary/60" />
                    Fin des annonces
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <LikedAdsDrawer
        open={likedDrawerOpen}
        onOpenChange={setLikedDrawerOpen}
        userId={user?.uid}
      />

      {/* Report Dialog */}
      <Dialog open={!!reportAdId} onOpenChange={(open) => !open && setReportAdId(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Flag className="h-4 w-4 text-destructive" />
            Signaler cette annonce
          </DialogTitle>
          <div className="space-y-3 mt-2">
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger data-testid="select-report-reason-feed">
                <SelectValue placeholder="Raison du signalement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam / Publicité abusive</SelectItem>
                <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                <SelectItem value="misleading">Information trompeuse</SelectItem>
                <SelectItem value="non_medical">Non médical</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              data-testid="textarea-report-details-feed"
              placeholder="Détails supplémentaires (optionnel)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                data-testid="button-submit-report-feed"
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleReportSubmit}
                disabled={reporting}
              >
                {reporting ? 'Envoi...' : 'Envoyer le signalement'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportAdId(null)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
