import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Map, Bot, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavTab {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const tabs: NavTab[] = [
  { key: 'home', label: 'Accueil', icon: Home, path: '/' },
  { key: 'search', label: 'Recherche', icon: Search, path: '/search' },
  { key: 'map', label: 'Carte', icon: Map, path: '/map/providers' },
  { key: 'ai', label: 'IA Chat', icon: Bot, path: '/medical-assistant' },
  { key: 'settings', label: 'Réglages', icon: Settings, path: '/settings' },
];

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (tab: NavTab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[390px]">
        <div className="border-t border-border/40 bg-background/70 backdrop-blur-xl">
          {/* Safe area padding for iPhone notch */}
          <div className="flex items-center justify-around h-16 px-2">
            {tabs.map((tab) => {
              const active = isActive(tab);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-label={tab.label}
                >
                  <Icon className={cn('h-5 w-5', active && 'scale-110')} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                  {/* Active dot indicator */}
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
                  )}
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
