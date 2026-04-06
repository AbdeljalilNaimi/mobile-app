import { useEffect, useState } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Detects real-time network connectivity using browser online/offline events.
 * Syncs with TanStack Query's onlineManager so queries pause/resume automatically.
 *
 * Call once at the top of the provider tree (e.g. in NetworkStatusProvider).
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onlineManager.setOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      onlineManager.setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    onlineManager.setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
