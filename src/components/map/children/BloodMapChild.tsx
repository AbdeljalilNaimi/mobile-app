import { useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMapContext } from '@/contexts/MapContext';
import { useBloodCenters } from '@/hooks/useProviders';
import { ProviderCard } from '../ProviderCard';
import { createMarkerIcon } from '../MapMarkers';
import { CityHealthProvider } from '@/data/providers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProviderDistances } from '@/hooks/useProviderDistances';

const BloodMapChild = () => {
  const {
    mapRef, isReady, registerMarkerLayer, removeMarkerLayer,
    selectedProvider, setSelectedProvider, flyTo, geolocation,
    setSidebarProviders, setSidebarDistances, setSidebarLoading, setSidebarLabel,
  } = useMapContext();
  const { language } = useLanguage();
  const { data: providers = [], isLoading } = useBloodCenters();
  
  // Marker refs for optimization - prevent recreation on selection change
  const markerGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  
  const disclaimer = {
    fr: 'La disponibilité du sang dépend du stock réel. Pour les urgences vitales, contactez le 15.',
    ar: 'يعتمد توفر الدم على المخزون الفعلي. للطوارئ، اتصل بـ 15.',
    en: 'Blood availability depends on real stock. For emergencies, call 15.'
  };
  
  // Use shared distance hook
  const { distances, sortedProviders } = useProviderDistances(
    providers,
    geolocation.latitude,
    geolocation.longitude
  );

  // Feed sidebar
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
  
  // Optimized marker management - only update icons, don't recreate
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    
    // Create marker group once
    if (!markerGroupRef.current) {
      markerGroupRef.current = L.markerClusterGroup({ 
        chunkedLoading: true, 
        maxClusterRadius: 40 
      });
      registerMarkerLayer('blood', markerGroupRef.current);
    }
    
    const markerGroup = markerGroupRef.current;
    const existingMarkers = markersMapRef.current;
    const currentProviderIds = new Set(providers.map(p => p.id));
    
    // Remove markers for providers no longer in list
    existingMarkers.forEach((marker, id) => {
      if (!currentProviderIds.has(id)) {
        markerGroup.removeLayer(marker);
        existingMarkers.delete(id);
      }
    });
    
    // Add/update markers
    providers.forEach(provider => {
      const isSelected = selectedProvider?.id === provider.id;
      
      if (existingMarkers.has(provider.id)) {
        // Update existing marker icon
        const marker = existingMarkers.get(provider.id)!;
        marker.setIcon(createMarkerIcon(provider.type, isSelected, false));
      } else {
        // Create new marker
        const marker = L.marker([provider.lat, provider.lng], {
          icon: createMarkerIcon(provider.type, isSelected, false)
        });
        marker.on('click', () => handleProviderClick(provider));
        markerGroup.addLayer(marker);
        existingMarkers.set(provider.id, marker);
      }
    });
  }, [isReady, mapRef, providers, selectedProvider?.id, registerMarkerLayer, handleProviderClick]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markerGroupRef.current) {
        removeMarkerLayer('blood');
        markerGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [removeMarkerLayer]);
  
  return (
    <>
      <Alert variant="destructive" className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-auto max-w-lg bg-rose-500/10 border-rose-500/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{disclaimer[language as keyof typeof disclaimer] || disclaimer.fr}</AlertDescription>
      </Alert>
      
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

export default BloodMapChild;

