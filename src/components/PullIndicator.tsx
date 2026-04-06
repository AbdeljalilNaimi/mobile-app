import { ArrowDown, RefreshCw } from 'lucide-react';

interface PullIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

/**
 * PullIndicator — visual feedback for the pull-to-refresh gesture.
 *
 * Sits at the very top of the page (fixed, centred horizontally).
 * Slides in as the user pulls down, rotates the arrow when past threshold,
 * and switches to a spinning RefreshCw icon while refreshing.
 * No external animation library — pure CSS transform + transition.
 */
export function PullIndicator({
  pullDistance,
  isRefreshing,
  threshold = 72,
}: PullIndicatorProps) {
  const visible = pullDistance > 4 || isRefreshing;
  if (!visible) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const pastThreshold = pullDistance >= threshold;

  const translateY = isRefreshing ? 0 : pullDistance - 48;

  return (
    <div
      aria-live="polite"
      aria-label={isRefreshing ? 'Actualisation en cours…' : 'Tirer pour actualiser'}
      data-testid="pull-indicator"
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        transition: isRefreshing ? 'transform 0.25s ease' : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-md"
        style={{ opacity: isRefreshing ? 1 : Math.min(progress * 1.4, 1) }}
      >
        {isRefreshing ? (
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <ArrowDown
            className="h-5 w-5 text-primary transition-transform duration-150"
            style={{
              transform: `rotate(${pastThreshold ? 180 : 0}deg)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
