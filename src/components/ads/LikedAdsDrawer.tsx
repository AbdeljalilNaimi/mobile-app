import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Megaphone, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getLikedAds, Ad } from '@/services/adsService';

interface LikedAdsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function LikedAdsDrawer({ open, onOpenChange, userId }: LikedAdsDrawerProps) {
  const navigate = useNavigate();

  const { data: likedAds = [], isLoading } = useQuery<Ad[]>({
    queryKey: ['/api/ads/user', userId, 'liked-ads'],
    queryFn: () => getLikedAds(userId!),
    enabled: open && !!userId,
    staleTime: 60 * 1000,
  });

  const handleAdClick = (ad: Ad) => {
    onOpenChange(false);
    navigate(`/annonces/${ad.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <SheetHeader className="pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            Annonces aimées
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {!userId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Heart className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Connectez-vous pour voir vos annonces aimées
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3 px-1 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2">
                  <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : likedAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Megaphone className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Aucune annonce aimée
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Appuyez sur le cœur d'une annonce pour la retrouver ici
              </p>
            </div>
          ) : (
            <div className="space-y-1 px-1">
              {likedAds.map((ad) => (
                <button
                  key={ad.id}
                  data-testid={`liked-ad-row-${ad.id}`}
                  onClick={() => handleAdClick(ad)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 transition-colors text-left"
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {ad.image_url ? (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ad.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {ad.provider_name}
                    </p>
                    {ad.provider_city && (
                      <p className="text-xs text-muted-foreground/70 truncate">
                        {ad.provider_city}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
