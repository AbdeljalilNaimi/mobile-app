import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isProviderVerified } from '@/utils/verificationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CacheBadge } from '@/components/CacheBadge';
import { cacheService } from '@/services/cacheService';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullIndicator } from '@/components/PullIndicator';
import type { Translations } from '@/i18n/translations';
import type { Lang } from '@/data/providers';
import {
  Search, SlidersHorizontal, Star, MapPin, Phone, Clock,
  X, Stethoscope, Pill, Building, FlaskConical, ChevronRight,
  Loader2, ShieldCheck, Heart, List, LayoutGrid, ArrowRight,
  Accessibility, Baby, Droplets, ScanLine, Wrench, Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityHealthProvider } from '@/data/providers';

export type ViewMode = 'list' | 'grid' | 'map';
export type SortOption = 'relevance' | 'distance' | 'rating' | 'newest';

export interface FilterState {
  categories: string[];
  availability: string;
  minRating: number;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  wheelchairAccessible: boolean;
  languages: Lang[];
  area: string;
  maxDistance: number;
}

export type Provider = CityHealthProvider;

type SearchCategoryKey = keyof Translations['searchCategories'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  doctor: Stethoscope,
  clinic: Building,
  pharmacy: Pill,
  lab: FlaskConical,
  hospital: Building,
  birth_hospital: Baby,
  blood_cabin: Droplets,
  radiology_center: ScanLine,
  medical_equipment: Wrench,
};

const CATEGORY_IDS: ReadonlyArray<SearchCategoryKey> = [
  'doctor', 'clinic', 'pharmacy', 'lab', 'hospital',
  'birth_hospital', 'blood_cabin', 'radiology_center', 'medical_equipment',
];

const SORT_OPTIONS: SortOption[] = ['relevance', 'rating', 'distance', 'newest'];

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Lang; label: string }> = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const SearchPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<FilterState>({
    categories: initialType ? [initialType] : [],
    availability: 'any', minRating: 0,
    verifiedOnly: false, emergencyServices: false, wheelchairAccessible: false,
    languages: [], area: '', maxDistance: 50,
  });

  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const { data: allProviders = [], isLoading, isError, refetch } = useVerifiedProviders();

  const handleRefresh = useCallback(async () => {
    cacheService.invalidateProviders();
    await refetch();
  }, [refetch]);

  const { ref: pullRef, pullDistance, isRefreshing } = usePullToRefresh<HTMLDivElement>({ onRefresh: handleRefresh });

  const categories = useMemo(() => CATEGORY_IDS.map(id => ({
    id,
    label: t('searchCategories', id),
    icon: CATEGORY_ICONS[id],
  })), [t]);

  const sortOptions = useMemo(() => SORT_OPTIONS.map(value => ({
    value,
    label: value === 'relevance' ? t('search', 'sortRelevance')
      : value === 'rating' ? t('search', 'sortRating')
      : value === 'distance' ? t('search', 'sortDistance')
      : t('search', 'sortNewest'),
  })), [t]);

  const availableAreas = useMemo(() => {
    const areas = new Set(allProviders.map(p => p.area).filter(Boolean));
    return Array.from(areas).sort();
  }, [allProviders]);

  const activeFiltersCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.emergencyServices ? 1 : 0) +
    (filters.wheelchairAccessible ? 1 : 0) +
    (filters.availability !== 'any' ? 1 : 0) +
    (filters.languages.length > 0 ? 1 : 0) +
    (filters.area ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0);

  const toggleCategory = (id: string) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter(c => c !== id)
        : [...f.categories, id],
    }));
  };

  const filteredProviders = useMemo(() => {
    let results = [...allProviders];

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.specialty || '').toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length > 0) {
      results = results.filter(p => filters.categories.includes(p.type));
    }

    if (filters.minRating > 0) results = results.filter(p => p.rating >= filters.minRating);
    if (filters.verifiedOnly) results = results.filter(p => isProviderVerified(p));
    if (filters.emergencyServices) results = results.filter(p => p.emergency);
    if (filters.wheelchairAccessible) results = results.filter(p => p.accessible);
    if (filters.availability === 'now') results = results.filter(p => p.isOpen);
    if (filters.languages.length > 0) {
      results = results.filter(p =>
        filters.languages.some(lang => p.languages?.includes(lang))
      );
    }
    if (filters.area) {
      results = results.filter(p => p.area === filters.area);
    }
    if (filters.maxDistance < 50) {
      results = results.filter(p => {
        const dist = p.distance;
        if (!dist || dist === 0) return true;
        return dist <= filters.maxDistance;
      });
    }

    const sorted = [...results];
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'distance') sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id.localeCompare(a.id));

    return sorted;
  }, [allProviders, debouncedQuery, filters, sortBy]);

  const clearAll = () => setFilters({
    categories: [], availability: 'any', minRating: 0,
    verifiedOnly: false, emergencyServices: false, wheelchairAccessible: false,
    languages: [], area: '', maxDistance: 50,
  });

  return (
    <div ref={pullRef} className="flex flex-col min-h-full bg-background">
      <PullIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      {/* Sticky header: search bar + category chips + sort & filter bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30">
        {/* Search input */}
        <div className="px-4 pt-3 pb-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search', 'placeholder')}
            className="pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border/50 text-sm"
          />
          {searchQuery && (
            <button
              data-testid="button-clear-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category chips row */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => {
            const active = filters.categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                data-testid={`chip-category-${cat.id}`}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm border-primary'
                    : 'bg-muted text-muted-foreground border-border/60 hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort + Filter bar */}
        <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              data-testid={`button-sort-${opt.value}`}
              onClick={() => setSortBy(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                sortBy === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
            <button
              data-testid="button-view-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              data-testid="button-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              data-testid="button-open-filters"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 rounded-lg border-border/50 relative"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] flex flex-col">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base">{t('filters', 'advancedFilters')}</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs" data-testid="badge-active-filters">
                    {activeFiltersCount} {t('filters', 'activeFilters')}
                  </Badge>
                )}
              </div>
            </SheetHeader>
            <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-1">

              {/* Availability */}
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('filters', 'availability')}</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'any', label: t('filters', 'anyTime') },
                    { value: 'now', label: t('filters', 'openNow') },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      data-testid={`filter-availability-${opt.value}`}
                      onClick={() => setFilters(f => ({ ...f, availability: opt.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filters.availability === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum rating */}
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('filters', 'minimumRating')}</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      data-testid={`filter-rating-${rating}`}
                      onClick={() => setFilters(f => ({ ...f, minRating: rating === f.minRating ? 0 : rating }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${rating <= filters.minRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground" data-testid="text-rating-label">
                    {filters.minRating > 0
                      ? `${filters.minRating}+ ${t('filters', 'stars')}`
                      : t('filters', 'anyRating')}
                  </span>
                </div>
              </div>

              {/* Special options */}
              <div>
                <Label className="text-sm font-medium mb-3 block">{t('filters', 'specialOptions')}</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      data-testid="filter-verified-only"
                      checked={filters.verifiedOnly}
                      onCheckedChange={v => setFilters(f => ({ ...f, verifiedOnly: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {t('filters', 'verifiedOnly')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      data-testid="filter-emergency"
                      checked={filters.emergencyServices}
                      onCheckedChange={v => setFilters(f => ({ ...f, emergencyServices: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <Heart className="h-4 w-4 text-destructive" />
                      {t('filters', 'emergencyServices')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      data-testid="filter-wheelchair"
                      checked={filters.wheelchairAccessible}
                      onCheckedChange={v => setFilters(f => ({ ...f, wheelchairAccessible: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <Accessibility className="h-4 w-4 text-primary" />
                      {t('filters', 'wheelchairAccessible')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Spoken languages */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('filters', 'spokenLanguages')}
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang.value}
                      data-testid={`filter-lang-${lang.value}`}
                      onClick={() => setFilters(f => ({
                        ...f,
                        languages: f.languages.includes(lang.value)
                          ? f.languages.filter(l => l !== lang.value)
                          : [...f.languages, lang.value],
                      }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filters.languages.includes(lang.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              {availableAreas.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 text-primary inline mr-1.5" />
                    {t('filters', 'neighborhood')}
                  </Label>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      data-testid="filter-area-all"
                      onClick={() => setFilters(f => ({ ...f, area: '' }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        !filters.area
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {t('filters', 'allNeighborhoods')}
                    </button>
                    {availableAreas.map(area => (
                      <button
                        key={area}
                        data-testid={`filter-area-${area}`}
                        onClick={() => setFilters(f => ({ ...f, area }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filters.area === area
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Maximum distance */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <Label className="font-medium">{t('filters', 'maxDistance')}</Label>
                  <span className="text-xs text-muted-foreground font-medium" data-testid="text-distance-value">
                    {filters.maxDistance} {t('search', 'km')}
                  </span>
                </div>
                <Slider
                  data-testid="slider-max-distance"
                  value={[filters.maxDistance]}
                  onValueChange={v => setFilters(f => ({ ...f, maxDistance: v[0] }))}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 pt-3 border-t border-border/50">
              <Button
                data-testid="button-reset-filters"
                variant="outline"
                className="flex-1"
                onClick={clearAll}
              >
                {t('filters', 'reset')}
              </Button>
              <SheetClose asChild>
                <Button data-testid="button-apply-filters" className="flex-1">
                  {t('filters', 'apply')} ({filteredProviders.length})
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
      </div>

      {/* Results count */}
      <div className="px-4 pt-2 pb-2 flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground" data-testid="text-results-count">
          {isLoading
            ? t('search', 'loading')
            : `${filteredProviders.length} ${filteredProviders.length !== 1 ? t('search', 'resultPlural') : t('search', 'resultSingular')}`}
        </p>
        <CacheBadge lastUpdated={cacheService.providersLastUpdated()} />
      </div>

      {/* Provider list */}
      <div className={`flex-1 px-4 pb-4 ${viewMode === 'grid' ? '' : 'space-y-3'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" data-testid="state-loading">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('search', 'loading')}</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" data-testid="state-error">
            <p className="text-sm text-muted-foreground">{t('search', 'error')}</p>
            <Button variant="outline" size="sm" data-testid="button-retry" onClick={() => refetch()}>
              {t('search', 'retry')}
            </Button>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" data-testid="state-empty">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('search', 'noResultsTitle')}</p>
            <Button variant="outline" size="sm" data-testid="button-clear-filters" onClick={clearAll}>
              {t('search', 'clearFilters')}
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredProviders.map((provider, i) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.3 }}
                >
                  <ProviderGridCard provider={provider} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProviders.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
              >
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

/* ── Provider Card ── */
function ProviderCard({ provider }: { provider: CityHealthProvider }) {
  const { t } = useLanguage();
  const verified = isProviderVerified(provider);

  return (
    <Link to={`/provider/${provider.id}`} data-testid={`card-provider-${provider.id}`}>
      <Card className="p-3.5 rounded-2xl border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all duration-200 group">
        <div className="flex gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              {verified ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  {t('provider', 'verified')}
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {provider.type}
                </span>
              )}
              {provider.isOpen && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" data-testid={`badge-open-${provider.id}`}>
                  <Clock className="h-2.5 w-2.5" /> {t('provider', 'openNow')}
                </span>
              )}
              {provider.emergency && (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20" data-testid={`badge-emergency-${provider.id}`}>
                  {t('provider', 'emergency')}
                </span>
              )}
            </div>

            {/* Name & specialty */}
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors" data-testid={`text-provider-name-${provider.id}`}>{provider.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{provider.specialty || provider.type}</p>

            {/* Details row */}
            <div className="flex items-center gap-3 mt-1.5">
              {provider.rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs" data-testid={`text-rating-${provider.id}`}>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{provider.rating.toFixed(1)}</span>
                </span>
              )}
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{provider.address}</span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1.5 mt-2">
              {provider.phone && (
                <button
                  data-testid={`button-call-${provider.id}`}
                  onClick={(e) => { e.preventDefault(); window.open(`tel:${provider.phone}`, '_self'); }}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                >
                  <Phone className="h-2.5 w-2.5 mr-0.5" /> {t('provider', 'callNow')}
                </button>
              )}
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full border border-primary/30 text-primary" data-testid={`button-view-profile-${provider.id}`}>
                <ChevronRight className="h-2.5 w-2.5 mr-0.5" /> {t('provider', 'viewProfile')}
              </span>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex-shrink-0 overflow-hidden">
            {provider.image ? (
              <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/* ── Provider Grid Card ── */
function ProviderGridCard({ provider }: { provider: CityHealthProvider }) {
  const { t } = useLanguage();
  const verified = isProviderVerified(provider);

  return (
    <Link to={`/provider/${provider.id}`} data-testid={`card-grid-provider-${provider.id}`}>
      <Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.97] transition-all duration-200 group overflow-hidden">
        {/* Image section */}
        <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
          {provider.image ? (
            <img
              src={provider.image}
              alt={provider.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Stethoscope className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
          {/* Rating badge overlay */}
          {provider.rating > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm shadow-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
            </div>
          )}
          {/* Verified badge overlay */}
          {verified && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/90 backdrop-blur-sm shadow-sm">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">{t('provider', 'verified')}</span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold text-foreground truncate" data-testid={`text-grid-name-${provider.id}`}>{provider.name}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{provider.specialty || provider.type}</p>

          {/* Arrow button */}
          <div className="mt-3 flex justify-center">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors shadow-sm">
              <ArrowRight className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default SearchPage;
