import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStatusContext } from '@/contexts/NetworkStatusContext';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Full-screen overlay shown when the device has no internet connection.
 * Disappears automatically once the connection is restored.
 */
export const NoConnectionScreen = () => {
  const { isOnline } = useNetworkStatusContext();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center"
      data-testid="no-connection-screen"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="rounded-full bg-muted p-6">
          <WifiOff className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground" data-testid="offline-title">
            {t('offline', 'title')}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed" data-testid="offline-message">
            {t('offline', 'message')}
          </p>
        </div>

        <Button
          onClick={() => window.location.reload()}
          className="w-full gap-2"
          size="lg"
          data-testid="offline-retry-button"
        >
          <RefreshCw className="h-4 w-4" />
          {t('offline', 'retry')}
        </Button>
      </div>
    </div>
  );
};
