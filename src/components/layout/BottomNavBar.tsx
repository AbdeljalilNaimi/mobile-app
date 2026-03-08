import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Map, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { key: 'profile', label: 'Profil', path: '/profile', isProfile: true },
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

  const getInitial = (): string | null => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return null;
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
                    'flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] rounded-2xl transition-colors duration-200 active:scale-90 relative px-2 py-1.5',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                  aria-label={tab.label}
                >
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-8 bg-primary/8 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <div className="relative z-10">
                    {tab.isProfile ? (
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full overflow-hidden transition-all border border-border/60',
                          active && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                        )}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            {getInitial() ? (
                              <span className="text-[9px] font-semibold text-secondary-foreground">
                                {getInitial()}
                              </span>
                            ) : (
                              <User className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <motion.div
                          animate={{ scale: active ? 1.1 : 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <Icon
                            className="h-6 w-6"
                            strokeWidth={active ? 2.5 : 1.5}
                          />
                        </motion.div>
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
                      'leading-none transition-all relative z-10',
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
