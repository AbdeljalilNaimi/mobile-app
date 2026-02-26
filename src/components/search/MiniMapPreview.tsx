import { useEffect, useRef, memo } from 'react';
import { MapPin, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityHealthProvider } from '@/data/providers';

interface MiniMapPreviewProps {
  providers: CityHealthProvider[];
  onOpenFullMap: () => void;
  className?: string;
}

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MiniMapPreview = memo(({ providers, onOpenFullMap, className }: MiniMapPreviewProps) => {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const tx = {
    fr: { viewFullMap: 'Voir la carte complète', providers: 'prestataires' },
    ar: { viewFullMap: 'عرض الخريطة الكاملة', providers: 'مقدمي الخدمات' },
    en: { viewFullMap: 'View full map', providers: 'providers' }
  }[language as 'fr' | 'ar' | 'en'] || { viewFullMap: 'View full map', providers: 'providers' };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any existing map instance first
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create map with disabled interactions
    const map = L.map(mapContainerRef.current, {
      center: [35.1975, -0.6300],
      zoom: 11,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      // Robust cleanup: remove all listeners before destroying
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when providers change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add small markers for each provider
    providers.forEach((provider) => {
      const marker = L.circleMarker([provider.lat, provider.lng], {
        radius: 4,
        fillColor: '#1a73e8',
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
      marker.addTo(map);
    });

    // Fit bounds if we have providers
    if (providers.length > 0) {
      const bounds = L.latLngBounds(providers.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [providers]);

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden border border-border bg-muted cursor-pointer group",
        className
      )}
      onClick={onOpenFullMap}
    >
      {/* Mini map container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[180px]"
      />
      
      {/* Overlay with action button */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <Button 
            size="sm" 
            variant="secondary"
            className="shadow-lg gap-2"
          >
            <Maximize2 size={14} />
            {tx.viewFullMap}
          </Button>
        </div>
      </div>
      
      {/* Provider count badge */}
      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
        <MapPin size={12} className="text-primary" />
        {providers.length} {tx.providers}
      </div>
    </div>
  );
});

MiniMapPreview.displayName = 'MiniMapPreview';
