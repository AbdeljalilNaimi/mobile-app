import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Map, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/contexts/AuthContext';

interface NavTab {
  key: string;
  label: string;
  icon?: React.ElementType;
  path: string;
  badge?: 'notification' | 'location';
  isProfile?: boolean;
}

const tabs: NavTab[] = [
  { key: 'home', label: 'Accueil', icon: Home, path: '/' },
  { key: 'search', label: 'Recherche', icon: Search, path: '/search' },
  { key: 'map', label: 'Carte', icon: Map, path: '/map/providers', badge: 'location' },
  { key: 'ai', label: 'IA Chat', icon: Bot, path: '/medical-assistant', badge: 'notification' },
  { key: 'profile', label: 'Profil', path: '/citizen/profile', isProfile: true },
];

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation } = useUserLocation();
  const { profile, user } = useAuth();

  const isActive = (tab: NavTab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  const getInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[430px] px-4 pb-[env(safe-area-inset-bottom,6px)] mb-2">
        <div className="bg-background/80 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] rounded-[20px]">
          <div className="flex items-center justify-around h-14 px-1">
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
                    {tab.isProfile ? (
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full overflow-hidden transition-all',
                          active && 'ring-2 ring-[#1D4ED8] ring-offset-1'
                        )}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {getInitial()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Icon
                          className={cn('h-6 w-6 transition-transform', active && 'scale-105')}
                          strokeWidth={active ? 2.5 : 1.5}
                        />
                        {tab.badge === 'notification' && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
                        )}
                        {tab.badge === 'location' && userLocation && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        )}
                      </>
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
        </div>
      </div>
    </nav>
  );
};
