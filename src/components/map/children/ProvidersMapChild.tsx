import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Search, X, SlidersHorizontal, Clock, Building2, Star, MapPin, Phone, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import { useMapContext } from '@/contexts/MapContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FILTERABLE_TYPES: ProviderType[] = [
  'hospital', 'clinic', 'doctor', 'pharmacy', 'lab', 'radiology_center'
];

const ProvidersMapChild = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mapRef, isReady, registerMarkerLayer, removeMarkerLayer,
    selectedProvider, setSelectedProvider, flyTo, fitBounds,
    geolocation, isRTL, calculateRoute, isRouting,
    setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel,
  } = useMapContext();
  const { language } = useLanguage();
  const { data: providers = [], isLoading } = useVerifiedProviders();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedTypes, setSelectedTypes] = useState<Set<ProviderType>>(() => {
    const p = searchParams.get('types');
    return p ? new Set(p.split(',').filter(t => FILTERABLE_TYPES.includes(t as ProviderType)) as ProviderType[]) : new Set();
  });
  const [openNowOnly, setOpenNowOnly] = useState(() => searchParams.get('open') === '1');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTypes.size > 0) params.set('types', Array.from(selectedTypes).join(','));
    if (openNowOnly) params.set('open', '1');
    if (debouncedSearch) params.set('q', debouncedSearch);
    setSearchParams(params, { replace: true });
  }, [selectedTypes, openNowOnly, debouncedSearch, setSearchParams]);

  const toggleType = (type: ProviderType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const clearFilters = () => { setSelectedTypes(new Set()); setOpenNowOnly(false); setSearchQuery(''); };
  const activeFilterCount = selectedTypes.size + (openNowOnly ? 1 : 0);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.specialty || '').toLowerCase().includes(q) && !p.address.toLowerCase().includes(q)) return false;
      }
      if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
      if (openNowOnly && !p.isOpen) return false;
      return true;
    });
  }, [providers, selectedTypes, openNowOnly, debouncedSearch]);

  const distances = useMemo(() => {
    const map = new Map<string, number>();
    filteredProviders.forEach(p => {
      const d = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (d !== null) map.set(p.id, d);
    });
    return map;
  }, [filteredProviders, geolocation]);

  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => (distances.get(a.id) ?? 999) - (distances.get(b.id) ?? 999));
  }, [filteredProviders, distances]);

  // Feed sidebar context
  useEffect(() => {
    setSidebarLabel('');
    setSidebarLoading(isLoading);
    setSidebarProviders(sortedProviders);
    setSidebarDistances(distances);
  }, [sortedProviders, distances, isLoading, setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel]);

  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  }, [setSelectedProvider, flyTo]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];
    const q = debouncedSearch.toLowerCase();
    return providers.filter(p =>
      p.name.toLowerCase().includes(q) || (p.specialty || '').toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [providers, debouncedSearch]);

  // Markers
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50, showCoverageOnHover: false });
      registerMarkerLayer('providers', markerGroupRef.current);
    }
    const mg = markerGroupRef.current;
    const em = markersMapRef.current;
    const ids = new Set(filteredProviders.map(p => p.id));
    em.forEach((m, id) => { if (!ids.has(id)) { mg.removeLayer(m); em.delete(id); } });
    filteredProviders.forEach(p => {
      const sel = selectedProvider?.id === p.id;
      if (em.has(p.id)) {
        em.get(p.id)!.setIcon(createMarkerIcon(p.type, sel, p.emergency));
      } else {
        const m = L.marker([p.lat, p.lng], { icon: createMarkerIcon(p.type, sel, p.emergency) });
        m.on('click', () => handleProviderClick(p));
        mg.addLayer(m);
        em.set(p.id, m);
      }
    });
  }, [isReady, mapRef, filteredProviders, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);

  useEffect(() => {
    return () => { if (markerGroupRef.current) { removeMarkerLayer('providers'); markerGroupRef.current = null; markersMapRef.current.clear(); } };
  }, [removeMarkerLayer]);

  const typeLabel = (type: ProviderType) => PROVIDER_TYPE_LABELS[type]?.[language as 'fr' | 'ar' | 'en'] || PROVIDER_TYPE_LABELS[type]?.fr || type;

  return (
    <>
      {/* ── Search bar (floating top) ── */}
      <div className="absolute top-14 left-3 right-3 z-[1000]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder={language === 'ar' ? 'بحث...' : 'Rechercher un prestataire...'}
            className="h-10 pl-9 pr-20 rounded-full bg-background/90 backdrop-blur-lg border-border/50 shadow-lg text-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSearchQuery('')}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            {/* Filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span>Filtres</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                        Effacer tout
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-5 py-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      Ouvert maintenant
                    </Label>
                    <Switch checked={openNowOnly} onCheckedChange={setOpenNowOnly} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Type de prestataire
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FILTERABLE_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all',
                            selectedTypes.has(type)
                              ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                              : 'border-border bg-muted/30 text-foreground hover:bg-muted'
                          )}
                        >
                          <span>{PROVIDER_TYPE_LABELS[type]?.icon}</span>
                          <span className="truncate text-xs">{typeLabel(type)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search suggestions dropdown */}
        <AnimatePresence>
          {searchFocused && searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1 bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl overflow-hidden"
            >
              {searchSuggestions.map(p => (
                <button
                  key={p.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
                  onMouseDown={() => { setSearchQuery(p.name); handleProviderClick(p); setSearchFocused(false); }}
                >
                  <ProviderAvatar image={p.image} name={p.name} type={p.type} className="h-8 w-8" iconSize={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.specialty || typeLabel(p.type)}</p>
                  </div>
                  {distances.get(p.id) !== undefined && (
                    <span className="text-xs text-muted-foreground">{distances.get(p.id)!.toFixed(1)} km</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count pill */}
        {(debouncedSearch || activeFilterCount > 0) && (
          <div className="mt-2 flex justify-center">
            <Badge variant="secondary" className="rounded-full text-xs shadow-sm bg-background/80 backdrop-blur-sm">
              {filteredProviders.length} résultat{filteredProviders.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Bottom sheet for selected provider ── */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-20 left-2 right-2 z-[1000]"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 space-y-3">
              {/* Handle bar */}
              <div className="flex justify-center">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Close */}
              <Button
                variant="ghost" size="icon"
                className="absolute top-3 right-3 h-7 w-7 rounded-full"
                onClick={() => setSelectedProvider(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Provider info */}
              <div className="flex items-start gap-3">
                <ProviderAvatar
                  image={selectedProvider.image}
                  name={selectedProvider.name}
                  type={selectedProvider.type}
                  className="h-14 w-14 rounded-xl"
                  iconSize={24}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-base truncate">{selectedProvider.name}</h3>
                    {isProviderVerified(selectedProvider) && <VerifiedBadge type="verified" size="sm" showTooltip={false} />}
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedProvider.specialty || typeLabel(selectedProvider.type)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {selectedProvider.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{selectedProvider.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {distances.get(selectedProvider.id) !== undefined && (
                      <span className="text-xs text-muted-foreground">{distances.get(selectedProvider.id)!.toFixed(1)} km</span>
                    )}
                    {selectedProvider.emergency && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">24/7</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{selectedProvider.address}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  className="rounded-xl h-10 text-xs gap-1.5"
                  onClick={() => calculateRoute(selectedProvider)}
                  disabled={isRouting}
                >
                  {isRouting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  Itinéraire
                </Button>
                {selectedProvider.phone && (
                  <Button size="sm" variant="outline" className="rounded-xl h-10 text-xs gap-1.5" asChild>
                    <a href={`tel:${selectedProvider.phone}`}>
                      <Phone className="h-4 w-4" />
                      Appeler
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-xl h-10 text-xs gap-1.5" asChild>
                  <Link to={`/provider/${selectedProvider.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Profil
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProvidersMapChild;
