import { WifiOff } from 'lucide-react';
import { useNetworkStatusContext } from '@/contexts/NetworkStatusContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CacheBadgeProps {
  lastUpdated?: Date | null;
  className?: string;
}

/**
 * Small pill shown when the app is offline and data is being served from cache.
 * Returns null when the device is online.
 */
export const CacheBadge = ({ lastUpdated, className = '' }: CacheBadgeProps) => {
  const { isOnline } = useNetworkStatusContext();
  const { t } = useLanguage();

  if (isOnline) return null;

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 ${className}`}
      data-testid="cache-badge"
      role="status"
    >
      <WifiOff className="h-3 w-3 shrink-0" />
      {formattedTime
        ? `${t('cache', 'offlineBadge')} · ${t('cache', 'lastUpdated')} ${formattedTime}`
        : t('cache', 'offlineBadge')}
    </span>
  );
};
