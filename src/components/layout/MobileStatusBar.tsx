import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'CityHealth',
  '/search': 'Recherche',
  '/map/providers': 'Carte',
  '/map/emergency': 'Urgences',
  '/map/blood': 'Don de sang',
  '/medical-assistant': 'Assistant IA',
  '/profile': 'Mon Profil',
  '/favorites': 'Favoris',
  '/citizen/dashboard': 'Tableau de bord',
  '/citizen/appointments': 'Rendez-vous',
  '/community': 'Communauté',
  '/contact': 'Contact',
};

export const MobileStatusBar = () => {
  const location = useLocation();
  
  const title = routeTitles[location.pathname] || 'CityHealth';
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* iOS-style status bar spacer */}
      <div className="h-[env(safe-area-inset-top,0px)] bg-background/80 backdrop-blur-xl" />
      
      <div className="h-12 flex items-center justify-center bg-background/80 backdrop-blur-xl border-b border-border/40">
        <h1 className={`text-base font-semibold text-foreground ${isHome ? 'text-primary' : ''}`}>
          {title}
        </h1>
      </div>
    </header>
  );
};
