import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, TrendingUp, Clock, Star, Loader2, Megaphone, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdCard } from '@/components/ads/AdCard';
import { AdDetailDialog } from '@/components/ads/AdDetailDialog';
import { Ad, getApprovedAds, getUserLikes, getUserSaves, AdFilters } from '@/services/adsService';
import { Helmet } from 'react-helmet-async';

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
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userSaves, setUserSaves] = useState<string[]>([]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (currentOffset: number, replace: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const result = await getApprovedAds({
        search: search || undefined,
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
  }, [search, sort]);

  useEffect(() => {
    setAds([]);
    setOffset(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [search, sort]);

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

  return (
    <>
      <Helmet>
        <title>Annonces Pro - CityHealth Sidi Bel Abbès</title>
        <meta name="description" content="Découvrez les annonces et offres de nos professionnels de santé vérifiés à Sidi Bel Abbès." />
      </Helmet>

      <div className="min-h-screen bg-muted/30 pt-20">
        <div className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Annonces Pro</h1>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Découvrez les services, offres et événements de nos professionnels de santé vérifiés.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="input-search-ads"
                  placeholder="Rechercher par titre, description ou prestataire..."
                  className="pl-10 h-11 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    data-testid={`button-sort-${opt.value}`}
                    variant={sort === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-11"
                    onClick={() => setSort(opt.value)}
                  >
                    <opt.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Aucune annonce pour le moment</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">Les annonces approuvées apparaîtront ici.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    userId={user?.uid}
                    isLiked={userLikes.includes(ad.id)}
                    isSaved={userSaves.includes(ad.id)}
                    onLikeToggle={handleLikeToggle}
                    onSaveToggle={handleSaveToggle}
                    onReport={() => setSelectedAd(ad)}
                    onClick={() => setSelectedAd(ad)}
                  />
                ))}
              </div>

              <div
                ref={sentinelRef}
                data-testid="sentinel-load-more"
                className="flex items-center justify-center py-10 mt-4"
              >
                {loadingMore && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
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

      <AdDetailDialog
        ad={selectedAd}
        open={!!selectedAd}
        onOpenChange={(open) => !open && setSelectedAd(null)}
        userId={user?.uid}
        isLiked={selectedAd ? userLikes.includes(selectedAd.id) : false}
        isSaved={selectedAd ? userSaves.includes(selectedAd.id) : false}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
      />
    </>
  );
}
