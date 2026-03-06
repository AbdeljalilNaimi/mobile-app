import { useEffect, useRef, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapProvider, useMapContext, MapMode } from '@/contexts/MapContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { createUserLocationMarker, createRouteStartMarker } from './MapMarkers';
import { MapPin, Loader2, LocateFixed, Car, Footprints, Route, Clock, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapChatWidget } from './MapChatWidget';
import { useCallback } from 'react';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Floating mode tabs at the top of the map — only shown on emergency/blood modes */

const MapMotherInner = () => {
  const {
    mapRef, mapContainerRef, center, zoom, setIsReady, isReady,
    geolocation, setUserPosition, locateUser,
    routesData, selectedRouteIndex, setSelectedRouteIndex,
    clearRoute, transportMode, setTransportMode, isRouting,
    sidebarProviders, flyTo, setSelectedProvider,
  } = useMapContext();

  const routeLayersRef = useRef<L.Polyline[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeStartMarkerRef = useRef<L.Marker | null>(null);
  const initRef = useRef(false);
  const { language } = useLanguage();
  const location = useLocation();
  const [isBotOpen, setIsBotOpen] = useState(false);

  const mode: MapMode = useMemo(() => {
    if (location.pathname.includes('/emergency')) return 'emergency';
    if (location.pathname.includes('/blood')) return 'blood';
    return 'providers';
  }, [location.pathname]);

  // Init map
  useEffect(() => {
    if (initRef.current || !mapContainerRef.current || mapRef.current) return;
    initRef.current = true;

    const map = L.map(mapContainerRef.current, {
      center, zoom, zoomControl: false, attributionControl: false,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    setIsReady(true);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [center, zoom, mapRef, mapContainerRef, setIsReady]);

  // Route polylines
  useEffect(() => {
    if (!mapRef.current) return;
    routeLayersRef.current.forEach(l => mapRef.current?.removeLayer(l));
    routeLayersRef.current = [];
    if (routeStartMarkerRef.current) {
      mapRef.current.removeLayer(routeStartMarkerRef.current);
      routeStartMarkerRef.current = null;
    }

    if (routesData && routesData.length > 0) {
      routesData.forEach((route, i) => {
        if (i === selectedRouteIndex) return;
        const poly = L.polyline(route.coordinates, { color: '#9ca3af', weight: 4, opacity: 0.5, dashArray: '5,10' }).addTo(mapRef.current!);
        poly.on('click', () => setSelectedRouteIndex(i));
        routeLayersRef.current.push(poly);
      });
      const sel = routesData[selectedRouteIndex];
      if (sel) {
        const poly = L.polyline(sel.coordinates, { color: '#3b82f6', weight: 6, opacity: 0.85 }).addTo(mapRef.current);
        routeLayersRef.current.push(poly);
      }
      const start = routesData[selectedRouteIndex]?.coordinates[0];
      if (start) {
        routeStartMarkerRef.current = L.marker(start, { icon: createRouteStartMarker(), zIndexOffset: 900 }).addTo(mapRef.current);
      }
    }
    return () => {
      routeLayersRef.current.forEach(l => mapRef.current?.removeLayer(l));
      routeLayersRef.current = [];
      if (routeStartMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(routeStartMarkerRef.current);
        routeStartMarkerRef.current = null;
      }
    };
  }, [routesData, selectedRouteIndex, mapRef, setSelectedRouteIndex]);

  // User location marker
  useEffect(() => {
    if (!mapRef.current || !geolocation.latitude || !geolocation.longitude) return;
    const pos: L.LatLngExpression = [geolocation.latitude, geolocation.longitude];
    setUserPosition({ lat: geolocation.latitude, lng: geolocation.longitude });
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(pos);
    } else {
      userMarkerRef.current = L.marker(pos, { icon: createUserLocationMarker(), zIndexOffset: 1000 }).addTo(mapRef.current);
    }
    return () => {
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
    };
  }, [mapRef, geolocation.latitude, geolocation.longitude, setUserPosition]);

  const handleModeChange = useCallback((m: MapMode) => {
    // Navigation handled by parent — we just use location-based mode
    const paths: Record<MapMode, string> = { providers: '/map/providers', emergency: '/map/emergency', blood: '/map/blood' };
    window.history.pushState(null, '', paths[m]);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const handleFlyToProvider = useCallback((id: string) => {
    const p = sidebarProviders.find(p => p.id === id);
    if (p) { flyTo(p.lat, p.lng, 16); setSelectedProvider(p); }
  }, [sidebarProviders, flyTo, setSelectedProvider]);

  const selectedRoute = routesData?.[selectedRouteIndex];

  return (
    <div className="relative w-full h-[calc(100vh-4rem-env(safe-area-inset-bottom,8px))] overflow-hidden bg-background">
      {/* Loading */}
      {!isReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Child map layers handle their own top UI */}

      {/* Right-side floating controls */}
      <div className="absolute bottom-28 right-3 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          className="h-11 w-11 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background"
          onClick={locateUser}
          disabled={geolocation.loading}
        >
          <LocateFixed className={cn('h-5 w-5 text-blue-500', geolocation.loading && 'animate-pulse')} />
        </Button>

        <Button
          size="icon"
          className={cn(
            'h-11 w-11 rounded-full shadow-lg border border-border/50',
            isBotOpen ? 'bg-primary text-primary-foreground' : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-background'
          )}
          onClick={() => setIsBotOpen(v => !v)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Route info bottom sheet */}
      {selectedRoute && (
        <div className="absolute bottom-20 left-2 right-2 z-[1000] bg-background/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setTransportMode('driving')}
                disabled={isRouting}
                className={cn('p-1.5 rounded-md transition-all', transportMode === 'driving' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground')}
              >
                <Car className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTransportMode('foot')}
                disabled={isRouting}
                className={cn('p-1.5 rounded-md transition-all', transportMode === 'foot' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground')}
              >
                <Footprints className="h-4 w-4" />
              </button>
            </div>
            <button onClick={clearRoute} className="p-1.5 rounded-full hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>

          {routesData!.map((route, i) => (
            <button
              key={i}
              onClick={() => setSelectedRouteIndex(i)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors',
                selectedRouteIndex === i ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
              )}
            >
              <div className={cn('w-3 h-1 rounded-full shrink-0', selectedRouteIndex === i ? 'bg-blue-500' : 'bg-muted-foreground')} />
              <Route className="h-4 w-4 text-primary shrink-0" />
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{route.distance} km</span>
                <span className="text-muted-foreground">≈ {route.duration} min</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {new Date(Date.now() + route.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* AI Chat widget */}
      <MapChatWidget
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        providers={sidebarProviders}
        onFlyToProvider={handleFlyToProvider}
        language={language}
      />

      {/* Child map layers (markers, etc.) */}
      <Outlet />
    </div>
  );
};

const MapMother = () => (
  <MapProvider>
    <MapMotherInner />
  </MapProvider>
);

export default MapMother;
