import { useLocation } from 'react-router-dom';
import { Wifi, Battery, Signal } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/': 'CityHealth',
  '/search': 'Recherche',
  '/map': 'Carte',
  '/medical-assistant': 'Assistant IA',
  '/profile': 'Mon Profil',
  '/favorites': 'Favoris',
  '/citizen/dashboard': 'Tableau de bord',
  '/citizen/appointments': 'Rendez-vous',
  '/community': 'Communauté',
  '/contact': 'Contact',
  '/blood-donation': 'Don de sang',
  '/annonces': 'Annonces',
  '/research': 'Recherche médicale',
  '/privacy': 'Confidentialité',
  '/terms': 'Conditions',
  '/faq': 'FAQ',
};

export const MobileStatusBar = () => {
  const location = useLocation();

  const title = Object.entries(routeTitles).find(([path]) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  })?.[1] || 'CityHealth';

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Safe area top */}
      <div className="h-[env(safe-area-inset-top,0px)] bg-background/90 backdrop-blur-xl" />

      <div className="h-11 flex items-center justify-center bg-background/90 backdrop-blur-xl border-b border-border/30">
        <span className="text-[15px] font-semibold text-foreground tracking-tight">{title}</span>
      </div>
    </header>
  );
};
