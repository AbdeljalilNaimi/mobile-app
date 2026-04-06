import { useNavigate } from 'react-router-dom';
import { Heart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

interface AdsPageHeroProps {
  onOpenLikedDrawer: () => void;
}

export function AdsPageHero({ onOpenLikedDrawer }: AdsPageHeroProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.uid);

  const displayName =
    user?.displayName || profile?.full_name || 'Vous';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarSrc = user?.photoURL || profile?.avatar_url || undefined;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a56db 0%, #4285F4 50%, #60a5fa 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
        <div className="absolute top-8 right-20 w-24 h-24 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white" />
      </div>

      <div className="relative px-4 pt-10 pb-6">
        <div className="flex items-start justify-between mb-5">
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar
                data-testid="hero-user-avatar"
                className="h-12 w-12 ring-2 ring-white/40 shadow-lg"
              >
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/70 text-xs font-medium">Bonjour,</p>
                <p className="text-white font-semibold text-base leading-tight truncate max-w-[140px]">
                  {displayName.split(' ')[0]}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xl">🏥</span>
              </div>
              <div>
                <p className="text-white/70 text-xs">Bienvenue sur</p>
                <p className="text-white font-semibold text-base">CityHealth</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              data-testid="button-liked-ads-drawer"
              variant="ghost"
              size="icon"
              onClick={onOpenLikedDrawer}
              className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20"
              aria-label="Annonces aimées"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button
                data-testid="button-notifications-hero"
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications')}
                className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              {unreadCount > 0 && (
                <Badge
                  data-testid="badge-unread-count"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] bg-red-500 text-white border-0 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mb-2">
          <h1 className="text-white text-2xl font-bold leading-tight">
            Annonces Pro
          </h1>
          <p className="text-white/75 text-sm mt-1 leading-relaxed">
            Offres et services de santé vérifiés
          </p>
        </div>
      </div>
    </div>
  );
}
