import { Outlet } from 'react-router-dom';
import { MobileStatusBar } from './MobileStatusBar';
import { BottomNavBar } from './BottomNavBar';

export const MobileAppShell = () => {
  return (
    <div className="min-h-screen bg-background mx-auto max-w-[390px] relative">
      <MobileStatusBar />
      
      {/* Main scrollable content area */}
      <main className="pb-24 min-h-[calc(100vh-3rem)]">
        <Outlet />
      </main>
      
      <BottomNavBar />
    </div>
  );
};
