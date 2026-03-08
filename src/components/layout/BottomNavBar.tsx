import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Map, Bot, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserLocation } from '@/hooks/useUserLocation';

interface NavTab {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: 'notification' | 'location';
}

const tabs: NavTab[] = [
  { key: 'home', label: 'Accueil', icon: Home, path: '/' },
  { key: 'search', label: 'Recherche', icon: Search, path: '/search' },
  { key: 'map', label: 'Carte', icon: Map, path: '/map/providers', badge: 'location' },
  { key: 'ai', label: 'IA Chat', icon: Bot, path: '/medical-assistant', badge: 'notification' },
  { key: 'settings', label: 'Réglages', icon: Settings, path: '/settings' },
];

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = useUserLocation();

  const isActive = (tab: NavTab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[430px]">
        <div className="bg-background/80 backdrop-blur-xl shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around h-16 px-1">
            {tabs.map((tab) => {
              const active = isActive(tab);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] rounded-2xl transition-all duration-150 active:scale-90 relative',
                    active
                      ? 'bg-primary/10 px-3 py-1.5 text-primary'
                      : 'text-muted-foreground px-2 py-1.5'
                  )}
                  aria-label={tab.label}
                >
                  <div className="relative">
                    <Icon
                      className={cn('h-6 w-6 transition-transform', active && 'scale-105')}
                      strokeWidth={active ? 2.5 : 1.5}
                    />
                    {/* Red notification dot for IA Chat */}
                    {tab.badge === 'notification' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
                    )}
                    {/* Pulsing green dot for Carte when location active */}
                    {tab.badge === 'location' && userLocation && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'leading-none transition-all',
                      active ? 'text-[11px] font-bold text-primary' : 'text-[10px] font-medium'
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Bottom safe area for iPhone */}
          <div className="h-[env(safe-area-inset-bottom,8px)]" />
        </div>
      </div>
    </nav>
  );
};
