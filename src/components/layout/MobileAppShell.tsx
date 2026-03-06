import { Outlet, useLocation } from 'react-router-dom';
import { MobileStatusBar } from './MobileStatusBar';
import { BottomNavBar } from './BottomNavBar';

export const MobileAppShell = () => {
  const location = useLocation();
  const isMapRoute = location.pathname.startsWith('/map');

  return (
    <div className="min-h-screen bg-background mx-auto max-w-[430px] relative">
      {!isMapRoute && <MobileStatusBar />}
      
      <main className={isMapRoute ? '' : 'pb-24 min-h-[calc(100vh-3rem)]'}>
        <Outlet />
      </main>
      
      <BottomNavBar />
    </div>
  );
};
