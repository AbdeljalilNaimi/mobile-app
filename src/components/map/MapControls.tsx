import { useMemo, useState, useCallback } from 'react';
import { 
  LocateFixed, 
  Maximize2, 
  Minimize2, 
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapContext, MapMode } from '@/contexts/MapContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { MapChatWidget } from './MapChatWidget';

interface MapControlsProps {
  mode: MapMode;
}

export const MapControls = ({ mode }: MapControlsProps) => {
  const { 
    locateUser, 
    isFullscreen, 
    toggleFullscreen,
    geolocation,
    isRTL,
    sidebarProviders,
    flyTo,
    setSelectedProvider,
  } = useMapContext();
  const { language } = useLanguage();
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  const t = useMemo(() => ({
    fr: {
      locate: 'Ma position',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter plein écran',
      assistant: 'Assistant IA'
    },
    ar: {
      locate: 'موقعي',
      fullscreen: 'ملء الشاشة',
      exitFullscreen: 'الخروج من ملء الشاشة',
      assistant: 'المساعد الذكي'
    },
    en: {
      locate: 'My location',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      assistant: 'AI Assistant'
    }
  }), []);
  
  const tx = t[language as keyof typeof t] || t.fr;

  const handleFlyToProvider = useCallback((id: string) => {
    const provider = sidebarProviders.find(p => p.id === id);
    if (provider) {
      flyTo(provider.lat, provider.lng, 16);
      setSelectedProvider(provider);
    }
  }, [sidebarProviders, flyTo, setSelectedProvider]);
  
  return (
    <>
      {/* Floating action buttons - bottom right */}
      <div className={cn(
        "absolute bottom-6 z-[1000] flex flex-col gap-3",
        isRTL ? "left-6" : "right-6"
      )}>
        {/* Fullscreen toggle */}
        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg bg-white dark:bg-card border border-border hover:scale-105 transition-transform"
          onClick={toggleFullscreen}
          title={isFullscreen ? tx.exitFullscreen : tx.fullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>

        {/* Geolocation button */}
        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg bg-white dark:bg-card border border-border hover:scale-105 transition-transform"
          onClick={locateUser}
          disabled={geolocation.loading}
          title={tx.locate}
        >
          <LocateFixed className={cn("h-5 w-5 text-blue-600", geolocation.loading && "animate-pulse")} />
        </Button>
        
        {/* AI Assistant / MapBot button */}
        <Button
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform",
            isBotOpen ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={() => setIsBotOpen(prev => !prev)}
          title={tx.assistant}
        >
          <MessageCircle className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* MapChatWidget */}
      <MapChatWidget
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        providers={sidebarProviders}
        onFlyToProvider={handleFlyToProvider}
        language={language}
      />
    </>
  );
};
