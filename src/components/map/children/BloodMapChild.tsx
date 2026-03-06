import { useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Droplet, Phone, Navigation, X, MapPin, Star, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMapContext } from '@/contexts/MapContext';
import { useBloodCenters } from '@/hooks/useProviders';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider } from '@/data/providers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProviderDistances } from '@/hooks/useProviderDistances';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { isProviderVerified } from '@/utils/verificationUtils';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const BloodMapChild = () => {
  const {
    mapRef, isReady, registerMarkerLayer, removeMarkerLayer,
    selectedProvider, setSelectedProvider, flyTo, geolocation,
    calculateRoute, isRouting,
    setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel,
  } = useMapContext();
  const { language } = useLanguage();
  const { data: providers = [], isLoading } = useBloodCenters();

  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const disclaimer: Record<string, string> = {
    fr: 'Disponibilité selon stock réel. Urgences → 15',
    ar: 'التوفر حسب المخزون. طوارئ → 15',
    en: 'Availability depends on stock. Emergency → 15',
  };

  const { distances, sortedProviders } = useProviderDistances(providers, geolocation.latitude, geolocation.longitude);

  useEffect(() => {
    setSidebarLabel('Don de sang');
    setSidebarLoading(isLoading);
    setSidebarProviders(sortedProviders);
    setSidebarDistances(distances);
  }, [sortedProviders, distances, isLoading, setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel]);

  const handleProviderClick = useCallback((provider: CityHealthProvider) => {
    setSelectedProvider(provider);
    flyTo(provider.lat, provider.lng, 16);
  }, [setSelectedProvider, flyTo]);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 40 });
      registerMarkerLayer('blood', markerGroupRef.current);
    }
    const mg = markerGroupRef.current;
    const em = markersMapRef.current;
    const ids = new Set(providers.map(p => p.id));
    em.forEach((m, id) => { if (!ids.has(id)) { mg.removeLayer(m); em.delete(id); } });
    providers.forEach(p => {
      const sel = selectedProvider?.id === p.id;
      if (em.has(p.id)) { em.get(p.id)!.setIcon(createMarkerIcon(p.type, sel, false)); }
      else {
        const m = L.marker([p.lat, p.lng], { icon: createMarkerIcon(p.type, sel, false) });
        m.on('click', () => handleProviderClick(p));
        mg.addLayer(m);
        em.set(p.id, m);
      }
    });
  }, [isReady, mapRef, providers, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);

  useEffect(() => {
    return () => { if (markerGroupRef.current) { removeMarkerLayer('blood'); markerGroupRef.current = null; markersMapRef.current.clear(); } };
  }, [removeMarkerLayer]);

  return (
    <>
      {/* Blood donation banner */}
      <div className="absolute top-14 left-3 right-3 z-[1000]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500/90 text-white shadow-lg text-xs font-medium">
          <Droplet className="h-4 w-4 shrink-0" />
          <span className="truncate">{disclaimer[language] || disclaimer.fr}</span>
        </div>
      </div>

      {/* Bottom sheet for selected provider */}
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
              <div className="flex justify-center"><div className="w-10 h-1 rounded-full bg-muted-foreground/30" /></div>
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 rounded-full" onClick={() => setSelectedProvider(null)}>
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-start gap-3">
                <ProviderAvatar image={selectedProvider.image} name={selectedProvider.name} type={selectedProvider.type} className="h-14 w-14 rounded-xl" iconSize={24} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-base truncate">{selectedProvider.name}</h3>
                    {isProviderVerified(selectedProvider) && <VerifiedBadge type="verified" size="sm" showTooltip={false} />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedProvider.rating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{selectedProvider.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {distances.get(selectedProvider.id) !== undefined && (
                      <span className="text-xs text-muted-foreground">{distances.get(selectedProvider.id)!.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{selectedProvider.address}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" className="rounded-xl h-10 text-xs gap-1.5" onClick={() => calculateRoute(selectedProvider)} disabled={isRouting}>
                  {isRouting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  Itinéraire
                </Button>
                {selectedProvider.phone && (
                  <Button size="sm" variant="outline" className="rounded-xl h-10 text-xs gap-1.5" asChild>
                    <a href={`tel:${selectedProvider.phone}`}><Phone className="h-4 w-4" />Appeler</a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-xl h-10 text-xs gap-1.5" asChild>
                  <Link to={`/provider/${selectedProvider.id}`}><ExternalLink className="h-4 w-4" />Profil</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BloodMapChild;
