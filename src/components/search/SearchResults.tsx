import React, { useState, memo, useCallback, useRef, useEffect } from 'react';
import { Heart, Phone, Star, MapPin, Clock, Navigation, Calendar, Share2, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Provider, ViewMode } from '@/pages/SearchPage';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { List, Grid, RowComponentProps, CellComponentProps } from 'react-window';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { isProviderVerified } from '@/utils/verificationUtils';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';

// Custom hook for detecting fast scrolling
const useScrollingIndicator = (threshold = 150) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const scrollVelocityRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastScrollTimeRef.current;
    
    // Calculate scroll velocity (lower time diff = faster scrolling)
    if (timeDiff < threshold && timeDiff > 0) {
      scrollVelocityRef.current = Math.min(1, threshold / timeDiff);
      setIsScrolling(true);
    }
    
    lastScrollTimeRef.current = now;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect scroll stop
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      scrollVelocityRef.current = 0;
    }, 150);
  }, [threshold]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { isScrolling, onScroll: handleScroll };
};

interface SearchResultsProps {
  providers: Provider[];
  viewMode: ViewMode;
  searchQuery: string;
}

interface ProviderCardProps {
  provider: Provider;
  isGrid: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

// Memoized ProviderCard component to prevent unnecessary re-renders
const ProviderCard = memo(({ provider, isGrid, isFavorite, onToggleFavorite }: ProviderCardProps) => {
  const { t } = useLanguage();
  const verified = isProviderVerified(provider);

  return (
    <Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Left: Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Badge row */}
            <div className="flex items-center gap-2 mb-2">
              {verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <CheckCircle size={12} />
                  {t('provider', 'verified') || 'Vérifié'}
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {provider.specialty || provider.type}
                </span>
              )}
              {provider.isOpen !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  provider.isOpen
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <Clock size={11} />
                  {provider.isOpen ? t('provider', 'openNow') : t('provider', 'closed')}
                </span>
              )}
            </div>

            {/* Name */}
            <Link to={`/provider/${provider.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {provider.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-0.5">{provider.specialty || provider.type}</p>

            {/* Details */}
            <div className="flex flex-col gap-1 mt-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="truncate">{provider.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="font-medium text-foreground">{provider.rating}</span>
                <span className="text-muted-foreground">({provider.reviewsCount})</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-auto pt-3">
              {provider.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs h-8 px-3"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`tel:${provider.phone}`, '_self');
                  }}
                >
                  <Phone size={13} className="mr-1" />
                  {t('provider', 'callNow')}
                </Button>
              )}
              <Link to={`/provider/${provider.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-3">
                  <Calendar size={13} className="mr-1" />
                  {t('provider', 'bookAppointment')}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full ml-auto"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(provider.id);
                }}
              >
                <Heart
                  size={15}
                  className={isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}
                />
              </Button>
            </div>
          </div>

          {/* Right: Avatar/Photo */}
          <div className="w-20 h-20 rounded-2xl bg-muted/60 flex-shrink-0 overflow-hidden">
            {provider.image && provider.image !== '/placeholder.svg' ? (
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <ProviderAvatar
                image={null}
                name={provider.name}
                type={provider.type}
                className="h-20 w-20 rounded-2xl"
                iconSize={28}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProviderCard.displayName = 'ProviderCard';

// Constants for virtualization
const LIST_ITEM_HEIGHT = 220;
const GRID_ITEM_HEIGHT = 420;
const GRID_ITEM_MIN_WIDTH = 280;

// Virtualization threshold - use virtualization only for large lists
const VIRTUALIZATION_THRESHOLD = 50;

// ItemData interfaces for react-window v2.x
interface ListRowData {
  providers: Provider[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

interface GridCellData {
  providers: Provider[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  columnCount: number;
}

// Row component for List virtualization - uses react-window v2.x API
const ListRowComponent = ({ 
  index, 
  style,
  ...props
}: RowComponentProps<ListRowData>) => {
  const { providers, favorites, onToggleFavorite } = props as ListRowData;
  const provider = providers[index];
  if (!provider) return null;

  return (
    <div style={{ ...style, paddingBottom: 16, paddingRight: 8 }}>
      <ProviderCard
        provider={provider}
        isGrid={false}
        isFavorite={favorites.includes(provider.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};

// Cell component for Grid virtualization - uses react-window v2.x API
const GridCellComponent = ({ 
  columnIndex, 
  rowIndex, 
  style, 
  ...props
}: CellComponentProps<GridCellData>) => {
  const { providers, favorites, onToggleFavorite, columnCount } = props as GridCellData;
  const index = rowIndex * columnCount + columnIndex;
  const provider = providers[index];
  if (!provider) return null;

  return (
    <div style={{ ...style, padding: 8 }}>
      <ProviderCard
        provider={provider}
        isGrid={true}
        isFavorite={favorites.includes(provider.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};

export const SearchResults = ({ providers, viewMode, searchQuery }: SearchResultsProps) => {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });
  const { isScrolling, onScroll } = useScrollingIndicator();

  // Calculate container size for virtualization
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width || 800,
          height: Math.max(window.innerHeight - 200, 400)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { requireAuth, AuthRequiredModal } = useAuthRequired();

  const toggleFavorite = useCallback((providerId: string) => {
    requireAuth(() => {
      setFavorites(prev =>
        prev.includes(providerId)
          ? prev.filter(id => id !== providerId)
          : [...prev, providerId]
      );
    });
  }, [requireAuth]);

  // Calculate grid columns based on container width
  const columnCount = Math.max(1, Math.floor(containerSize.width / GRID_ITEM_MIN_WIDTH));
  const columnWidth = containerSize.width / columnCount;
  const rowCount = Math.ceil(providers.length / columnCount);

  if (providers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('search', 'noResults')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('common', 'error')} - {t('search', 'noResults')}
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('common', 'filters')}:</p>
            <ul className="list-disc list-inside text-left">
              <li>{t('search', 'filterByArea')}</li>
              <li>{t('search', 'filterByType')}</li>
              <li>{t('search', 'filterByRating')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Use standard rendering for small lists, virtualization for large lists
  const useVirtualization = providers.length > VIRTUALIZATION_THRESHOLD;

  return (
    <div className="flex-1 p-4 relative" ref={containerRef}>
      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {providers.length} {t('search', 'results')} {searchQuery && `pour "${searchQuery}"`}
      </div>

      {/* Fast scroll indicator */}
      {isScrolling && useVirtualization && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">Chargement...</span>
          </div>
        </div>
      )}

      {useVirtualization ? (
        // Virtualized rendering for large lists
        viewMode === 'grid' ? (
          <div onScroll={onScroll}>
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowCount={rowCount}
              rowHeight={GRID_ITEM_HEIGHT}
              style={{ height: containerSize.height, width: containerSize.width }}
              className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              cellComponent={GridCellComponent}
              cellProps={{
                providers,
                favorites,
                onToggleFavorite: toggleFavorite,
                columnCount
              }}
            />
          </div>
        ) : (
          <div onScroll={onScroll}>
            <List
              rowCount={providers.length}
              rowHeight={LIST_ITEM_HEIGHT}
              style={{ height: containerSize.height, width: containerSize.width }}
              className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              rowComponent={ListRowComponent}
              rowProps={{
                providers,
                favorites,
                onToggleFavorite: toggleFavorite
              }}
            />
          </div>
        )
      ) : (
        // Standard rendering for small lists
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        }>
          {providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isGrid={viewMode === 'grid'}
              isFavorite={favorites.includes(provider.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
      <AuthRequiredModal />
    </div>
  );
};
