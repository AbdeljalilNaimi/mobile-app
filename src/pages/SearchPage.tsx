import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isProviderVerified } from '@/utils/verificationUtils';
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
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
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
  languages: string[];
  area: string;
  maxDistance: number;
}

export type Provider = CityHealthProvider;

const categories = [
  { id: 'doctor', label: 'Médecins', icon: Stethoscope },
  { id: 'clinic', label: 'Cliniques', icon: Building },
  { id: 'pharmacy', label: 'Pharmacies', icon: Pill },
  { id: 'lab', label: 'Laboratoires', icon: FlaskConical },
  { id: 'hospital', label: 'Hôpitaux', icon: Building },
  { id: 'birth_hospital', label: 'Maternité', icon: Baby },
  { id: 'blood_cabin', label: 'Don de sang', icon: Droplets },
  { id: 'radiology_center', label: 'Radiologie', icon: ScanLine },
  { id: 'medical_equipment', label: 'Équipement', icon: Wrench },
];

const languageOptions = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
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

  // Extract unique areas from providers for the area filter
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
        filters.languages.some(lang => p.languages?.includes(lang as any))
      );
    }
    if (filters.area) {
      results = results.filter(p => p.area === filters.area);
    }
    if (filters.maxDistance < 50) {
      results = results.filter(p => (p.distance || 0) <= filters.maxDistance);
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

        <div className="flex items-center gap-1.5">
          {/* View toggle */}
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
            <button
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
            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-border/50 relative">
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
                <SheetTitle className="text-base">Filtres avancés</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{activeFiltersCount} actifs</Badge>
                )}
              </div>
            </SheetHeader>
            <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-1">

              {/* Disponibilité */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Disponibilité</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'any', label: 'Tous' },
                    { value: 'now', label: 'Ouvert maintenant' },
                    { value: 'today', label: "Aujourd'hui" },
                    { value: 'week', label: 'Cette semaine' },
                  ].map(opt => (
                    <button
                      key={opt.value}
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

              {/* Note minimum - étoiles interactives */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Note minimum</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters(f => ({ ...f, minRating: rating === f.minRating ? 0 : rating }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${rating <= filters.minRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {filters.minRating > 0 ? `${filters.minRating}+ étoiles` : 'Toutes les notes'}
                  </span>
                </div>
              </div>

              {/* Options spéciales */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Options</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.verifiedOnly}
                      onCheckedChange={v => setFilters(f => ({ ...f, verifiedOnly: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Vérifiés uniquement
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.emergencyServices}
                      onCheckedChange={v => setFilters(f => ({ ...f, emergencyServices: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <Heart className="h-4 w-4 text-destructive" />
                      Services d'urgence
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.wheelchairAccessible}
                      onCheckedChange={v => setFilters(f => ({ ...f, wheelchairAccessible: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <Accessibility className="h-4 w-4 text-primary" />
                      Accessibilité fauteuil roulant
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.insuranceAccepted}
                      onCheckedChange={v => setFilters(f => ({ ...f, insuranceAccepted: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Assurance acceptée
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={filters.cnasOnly}
                      onCheckedChange={v => setFilters(f => ({ ...f, cnasOnly: !!v }))}
                    />
                    <span className="flex items-center gap-1.5 text-sm">
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">CNAS</Badge>
                      Remboursable uniquement
                    </span>
                  </label>
                </div>
              </div>

              {/* Localisation & Rayon */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Localisation</Label>
                <Input
                  placeholder="Ville ou code postal..."
                  value={filters.location}
                  onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                  className="mb-3 h-9 text-sm rounded-lg"
                />
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Rayon</span>
                  <span className="font-medium text-foreground">{filters.radius} km</span>
                </div>
                <Slider
                  value={[filters.radius]}
                  onValueChange={v => setFilters(f => ({ ...f, radius: v[0] }))}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Marques d'équipement */}
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-primary" />
                  Marques d'équipement
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_EQUIPMENT_BRANDS.map(brand => (
                    <Badge
                      key={brand}
                      variant={filters.equipmentBrands.includes(brand) ? 'default' : 'outline'}
                      className="cursor-pointer text-[11px] hover:opacity-80 transition-opacity"
                      onClick={() => {
                        const newBrands = filters.equipmentBrands.includes(brand)
                          ? filters.equipmentBrands.filter(b => b !== brand)
                          : [...filters.equipmentBrands, brand];
                        setFilters(f => ({ ...f, equipmentBrands: newBrands }));
                      }}
                    >
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 pt-3 border-t border-border/50">
              <Button variant="outline" className="flex-1" onClick={clearAll}>
                Réinitialiser
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">
                  Appliquer ({filteredProviders.length})
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Chargement...' : `${filteredProviders.length} résultat${filteredProviders.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Provider list */}
      <div className={`flex-1 px-4 pb-4 ${viewMode === 'grid' ? '' : 'space-y-3'}`}>
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

/* ── Provider Grid Card (Image 2 style) ── */
function ProviderGridCard({ provider }: { provider: CityHealthProvider }) {
  const verified = isProviderVerified(provider);

  return (
    <Link to={`/provider/${provider.id}`}>
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
              <span className="text-[10px] font-medium text-primary">Vérifié</span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold text-foreground truncate">{provider.name}</h3>
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
