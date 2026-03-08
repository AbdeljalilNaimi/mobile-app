import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isProviderVerified } from '@/utils/verificationUtils';
import {
  Search, SlidersHorizontal, Star, MapPin, Phone, Clock,
  X, Stethoscope, Pill, Building, FlaskConical, ChevronRight,
  Loader2, ShieldCheck, Heart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityHealthProvider } from '@/data/providers';

export type ViewMode = 'list' | 'grid' | 'map';
export type SortOption = 'relevance' | 'distance' | 'rating' | 'newest';

export interface FilterState {
  categories: string[];
  location: string;
  radius: number;
  availability: string;
  minRating: number;
  verifiedOnly: boolean;
  emergencyServices: boolean;
  wheelchairAccessible: boolean;
  insuranceAccepted: boolean;
  priceRange: [number, number];
  equipmentBrands: string[];
  cnasOnly: boolean;
}

export type Provider = CityHealthProvider;

const categories = [
  { id: 'doctors', label: 'Médecins', icon: Stethoscope, gradient: 'from-teal-500 to-cyan-400' },
  { id: 'pharmacies', label: 'Pharmacies', icon: Pill, gradient: 'from-emerald-500 to-green-400' },
  { id: 'laboratories', label: 'Laboratoires', icon: FlaskConical, gradient: 'from-amber-500 to-orange-400' },
  { id: 'clinics', label: 'Cliniques', icon: Building, gradient: 'from-indigo-500 to-violet-400' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'rating', label: 'Meilleure note' },
  { value: 'distance', label: 'Plus proche' },
  { value: 'newest', label: 'Récent' },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';

  const getInitialCategories = (type: string): string[] => {
    const typeMap: Record<string, string> = {
      doctor: 'doctors', pharmacy: 'pharmacies', lab: 'laboratories', clinic: 'clinics',
    };
    return typeMap[type] ? [typeMap[type]] : [];
  };

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterState>({
    categories: getInitialCategories(initialType),
    location: '', radius: 25, availability: 'any', minRating: 0,
    verifiedOnly: false, emergencyServices: false, wheelchairAccessible: false,
    insuranceAccepted: false, priceRange: [0, 500], equipmentBrands: [], cnasOnly: false,
  });

  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const { data: allProviders = [], isLoading, isError, refetch } = useVerifiedProviders();

  const activeFiltersCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.emergencyServices ? 1 : 0);

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
      results = results.filter(p =>
        filters.categories.some(cat => {
          const t = p.type.toLowerCase();
          if (cat === 'doctors') return t.includes('doctor') || t.includes('specialist');
          if (cat === 'pharmacies') return t.includes('pharmacy');
          if (cat === 'laboratories') return t.includes('lab');
          if (cat === 'clinics') return t.includes('clinic') || t.includes('hospital');
          return false;
        })
      );
    }

    if (filters.minRating > 0) results = results.filter(p => p.rating >= filters.minRating);
    if (filters.verifiedOnly) results = results.filter(p => isProviderVerified(p));
    if (filters.emergencyServices) results = results.filter(p => p.emergency);

    const sorted = [...results];
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'distance') sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    else if (sortBy === 'newest') sorted.sort((a, b) => b.id.localeCompare(a.id));

    return sorted;
  }, [allProviders, debouncedQuery, filters, sortBy]);

  const clearAll = () => setFilters(f => ({
    ...f, categories: [], minRating: 0, verifiedOnly: false, emergencyServices: false,
  }));

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Search bar */}
      <div className="sticky top-11 z-40 bg-background/90 backdrop-blur-xl px-4 pt-3 pb-2 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un médecin, pharmacie..."
            className="pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border/50 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips row */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map(cat => {
          const active = filters.categories.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
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

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-border/50 relative">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
            <SheetHeader>
              <SheetTitle className="text-base">Filtres avancés</SheetTitle>
            </SheetHeader>
            <div className="space-y-5 py-4 overflow-y-auto">
              {/* Rating filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Note minimum</Label>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button
                      key={r}
                      onClick={() => setFilters(f => ({ ...f, minRating: r }))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filters.minRating === r
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      {r === 0 ? 'Tous' : <><Star className="h-3 w-3 fill-current" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle filters */}
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Vérifiés uniquement</span>
                  <Checkbox
                    checked={filters.verifiedOnly}
                    onCheckedChange={v => setFilters(f => ({ ...f, verifiedOnly: !!v }))}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Services d'urgence</span>
                  <Checkbox
                    checked={filters.emergencyServices}
                    onCheckedChange={v => setFilters(f => ({ ...f, emergencyServices: !!v }))}
                  />
                </label>
              </div>

              {/* Clear + Apply */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={clearAll}>
                  Réinitialiser
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results count */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Chargement...' : `${filteredProviders.length} résultat${filteredProviders.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Provider list */}
      <div className="flex-1 px-4 pb-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Recherche en cours…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-muted-foreground">Erreur de chargement</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
            <Button variant="outline" size="sm" onClick={clearAll}>Effacer les filtres</Button>
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
  const verified = isProviderVerified(provider);

  return (
    <Link to={`/provider/${provider.id}`}>
      <Card className="p-3.5 rounded-2xl border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all duration-200 group">
        <div className="flex gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              {verified ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {provider.type}
                </span>
              )}
              {provider.isOpen && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Clock className="h-2.5 w-2.5" /> Ouvert
                </span>
              )}
              {provider.emergency && (
                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  Urgences
                </span>
              )}
            </div>

            {/* Name & specialty */}
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{provider.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{provider.specialty || provider.type}</p>

            {/* Details row */}
            <div className="flex items-center gap-3 mt-1.5">
              {provider.rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs">
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
                  onClick={(e) => { e.preventDefault(); window.open(`tel:${provider.phone}`, '_self'); }}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                >
                  <Phone className="h-2.5 w-2.5 mr-0.5" /> Appeler
                </button>
              )}
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-1 rounded-full border border-primary/30 text-primary">
                <ChevronRight className="h-2.5 w-2.5 mr-0.5" /> Voir profil
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

export default SearchPage;
