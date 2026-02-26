import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Filter, X, Clock, Building2, Search, MapPin, Maximize2, Menu, AlertTriangle, Droplet } from 'lucide-react';
import { useMapContext } from '@/contexts/MapContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider, ProviderType, PROVIDER_TYPE_LABELS } from '@/data/providers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const FILTERABLE_TYPES: ProviderType[] = [
  'hospital', 'clinic', 'doctor', 'pharmacy', 'lab', 'radiology_center'
];

const ProvidersMapChild = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    mapRef, 
    isReady, 
    registerMarkerLayer, 
    removeMarkerLayer,
    selectedProvider,
    setSelectedProvider,
    flyTo,
    fitBounds,
    geolocation,
    isRTL,
    setSidebarProviders,
    setSidebarDistances,
    setSidebarLoading,
    setSidebarLabel,
  } = useMapContext();
  const { language } = useLanguage();
  
  const { data: providers = [], isLoading } = useVerifiedProviders();
  
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<ProviderType>>(() => {
    const typesParam = searchParams.get('types');
    if (typesParam) {
      const types = typesParam.split(',').filter(t => FILTERABLE_TYPES.includes(t as ProviderType));
      return new Set(types as ProviderType[]);
    }
    return new Set();
  });
  const [openNowOnly, setOpenNowOnly] = useState(() => searchParams.get('open') === '1');
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  
  const t = useMemo(() => ({
    fr: {
      filters: 'Filtres',
      clearFilters: 'Effacer',
      openNow: 'Ouvert maintenant',
      providerTypes: 'Types de prestataires',
      activeFilters: 'filtres actifs',
      search: 'Rechercher...',
      searchPlaceholder: 'Nom, spécialité, adresse...',
      noResults: 'Aucun résultat trouvé',
      results: 'résultats',
      fitAll: 'Voir tous',
      all: 'Tous',
      emergency: 'Urgences',
      blood: 'Don de sang',
      showFilters: 'Filtres'
    },
    ar: {
      filters: 'الفلاتر',
      clearFilters: 'مسح',
      openNow: 'مفتوح الآن',
      providerTypes: 'أنواع مقدمي الخدمة',
      activeFilters: 'فلاتر نشطة',
      search: 'بحث...',
      searchPlaceholder: 'الاسم، التخصص، العنوان...',
      noResults: 'لم يتم العثور على نتائج',
      results: 'نتائج',
      fitAll: 'عرض الكل',
      all: 'الكل',
      emergency: 'طوارئ',
      blood: 'التبرع بالدم',
      showFilters: 'الفلاتر'
    },
    en: {
      filters: 'Filters',
      clearFilters: 'Clear',
      openNow: 'Open now',
      providerTypes: 'Provider types',
      activeFilters: 'active filters',
      search: 'Search...',
      searchPlaceholder: 'Name, specialty, address...',
      noResults: 'No results found',
      results: 'results',
      fitAll: 'Fit all',
      all: 'All',
      emergency: 'Emergency',
      blood: 'Blood donation',
      showFilters: 'Filters'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;
  
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
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };
  
  const clearFilters = () => {
    setSelectedTypes(new Set());
    setOpenNowOnly(false);
    setSearchQuery('');
  };
  
  const activeFilterCount = selectedTypes.size + (openNowOnly ? 1 : 0) + (debouncedSearch ? 1 : 0);
  
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSpecialty = (p.specialty || '').toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        const matchesType = p.type.toLowerCase().includes(query);
        if (!matchesName && !matchesSpecialty && !matchesAddress && !matchesType) return false;
      }
      if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
      if (openNowOnly && !p.isOpen) return false;
      return true;
    });
  }, [providers, selectedTypes, openNowOnly, debouncedSearch]);
  
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];
    const query = debouncedSearch.toLowerCase();
    return providers
      .filter(p => {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSpecialty = (p.specialty || '').toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        return matchesName || matchesSpecialty || matchesAddress;
      })
      .slice(0, 8);
  }, [providers, debouncedSearch]);
  
  const distances = useMemo(() => {
    const map = new Map<string, number>();
    filteredProviders.forEach(p => {
      const dist = geolocation.getDistanceFromUser(p.lat, p.lng);
      if (dist !== null) map.set(p.id, dist);
    });
    return map;
  }, [filteredProviders, geolocation]);
  
  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      const distA = distances.get(a.id) ?? 999;
      const distB = distances.get(b.id) ?? 999;
      return distA - distB;
    });
  }, [filteredProviders, distances]);
  
  // Feed sidebar
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
  
  const handleSearchSelect = useCallback((provider: CityHealthProvider) => {
    setSearchOpen(false);
    setSearchQuery(provider.name);
    handleProviderClick(provider);
  }, [handleProviderClick]);
  
  const handleFitAll = useCallback(() => {
    if (filteredProviders.length === 0 || !mapRef.current) return;
    const bounds = L.latLngBounds(
      filteredProviders.map(p => [p.lat, p.lng] as [number, number])
    );
    fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [filteredProviders, mapRef, fitBounds]);
  
  // Marker management
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });
      registerMarkerLayer('providers', markerGroupRef.current);
    }
    const markerGroup = markerGroupRef.current;
    const existingMarkers = markersMapRef.current;
    const currentProviderIds = new Set(filteredProviders.map(p => p.id));
    existingMarkers.forEach((marker, id) => {
      if (!currentProviderIds.has(id)) {
        markerGroup.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });
    filteredProviders.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      if (existingMarkers.has(provider.id)) {
        const marker = existingMarkers.get(provider.id)!;
        marker.setIcon(createMarkerIcon(provider.type, isSelected, provider.emergency));
      } else {
        const marker = L.marker([provider.lat, provider.lng], {
          icon: createMarkerIcon(provider.type, isSelected, provider.emergency)
        });
        marker.on('click', () => handleProviderClick(provider));
        markerGroup.addLayer(marker);
        existingMarkers.set(provider.id, marker);
      }
    });
  }, [isReady, mapRef, filteredProviders, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);
  
  useEffect(() => {
    return () => {
      if (markerGroupRef.current) {
        removeMarkerLayer('providers');
        markerGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [removeMarkerLayer]);
  
  return (
    <>
      {/* ========== UNIFIED CONTROL PANEL ========== */}
      <div className={cn(
        "absolute top-4 z-[1000] w-80 max-w-[calc(100%-2rem)]",
        "bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-xl rounded-2xl p-4",
        "flex flex-col gap-3",
        isRTL ? "right-4" : "left-4"
      )}>
        {/* Row 1: Menu button + Search bar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Search className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) setSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setSearchOpen(true);
                  }}
                  placeholder={tx.searchPlaceholder}
                  className={cn(
                    "h-9 text-sm border-border bg-muted/50",
                    isRTL ? "pr-9 pl-8" : "pl-9 pr-8"
                  )}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-6 w-6",
                      isRTL ? "left-1" : "right-1"
                    )}
                    onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-72 md:w-80 p-0" 
              align={isRTL ? "end" : "start"}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command>
                <CommandList>
                  {searchSuggestions.length === 0 ? (
                    <CommandEmpty>{tx.noResults}</CommandEmpty>
                  ) : (
                    <CommandGroup heading={`${searchSuggestions.length} ${tx.results}`}>
                      {searchSuggestions.map((provider) => (
                        <CommandItem
                          key={provider.id}
                          value={provider.name}
                          onSelect={() => handleSearchSelect(provider)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="flex-shrink-0 mt-0.5">
                              <ProviderAvatar
                                image={provider.image}
                                name={provider.name}
                                type={provider.type}
                                className="h-7 w-7"
                                iconSize={14}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{provider.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {provider.specialty || PROVIDER_TYPE_LABELS[provider.type]?.fr}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{provider.address}</span>
                              </div>
                            </div>
                            {provider.isOpen && (
                              <Badge variant="secondary" className="text-[10px] h-5 flex-shrink-0">
                                {tx.openNow}
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2: Mode pills (scrollable horizontal) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link to="/map/providers">
            <Badge 
              variant="default"
              className="cursor-pointer px-3 py-1.5 text-xs whitespace-nowrap gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5" />
              {tx.all}
            </Badge>
          </Link>
          <Link to="/map/emergency">
            <Badge 
              variant="outline"
              className="cursor-pointer px-3 py-1.5 text-xs whitespace-nowrap gap-1.5 bg-muted/50 hover:bg-muted"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {tx.emergency}
            </Badge>
          </Link>
          <Link to="/map/blood">
            <Badge 
              variant="outline"
              className="cursor-pointer px-3 py-1.5 text-xs whitespace-nowrap gap-1.5 bg-muted/50 hover:bg-muted"
            >
              <Droplet className="h-3.5 w-3.5" />
              {tx.blood}
            </Badge>
          </Link>
          
          {/* Fit All button inline */}
          {filteredProviders.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitAll}
              className="h-7 px-2 text-xs whitespace-nowrap gap-1 flex-shrink-0"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              {tx.fitAll}
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {filteredProviders.length}
              </Badge>
            </Button>
          )}
        </div>

        {/* Row 3: Collapsible Filters */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between h-8 text-xs gap-2"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                {tx.showFilters}
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3 space-y-3 animate-fade-in">
            {/* Header with clear */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-6 text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  {tx.clearFilters}
                </Button>
              </div>
            )}
            
            {/* Open Now Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="open-now" className="flex items-center gap-2 text-xs cursor-pointer">
                <Clock className="h-3.5 w-3.5 text-green-600" />
                {tx.openNow}
              </Label>
              <Switch
                id="open-now"
                checked={openNowOnly}
                onCheckedChange={setOpenNowOnly}
              />
            </div>
            
            {/* Provider Types */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {tx.providerTypes}
              </Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {FILTERABLE_TYPES.map(type => {
                  const label = PROVIDER_TYPE_LABELS[type];
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.has(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <Label 
                        htmlFor={`type-${type}`} 
                        className="text-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>{label.icon}</span>
                        <span>{language === 'ar' ? label.ar : label.fr}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {activeFilterCount > 0 && (
              <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
                {activeFilterCount} {tx.activeFilters}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      
      {selectedProvider && (
        <ProviderCard 
          provider={selectedProvider}
          distance={distances.get(selectedProvider.id)}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </>
  );
};

export default ProvidersMapChild;
