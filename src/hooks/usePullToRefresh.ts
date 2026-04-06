import { useState, useCallback, useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

interface UsePullToRefreshResult {
  pullDistance: number;
  isRefreshing: boolean;
}

/**
 * usePullToRefresh — window-level pull-to-refresh gesture hook.
 *
 * Attaches touch (and pointer/mouse for desktop debugging) events to
 * window. Only activates when the page is scrolled to the very top
 * (window.scrollY === 0). Calls `onRefresh` when the user pulls past
 * `threshold` pixels and releases.
 *
 * Returns `pullDistance` (0..maxPull, for animation) and `isRefreshing`.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 72,
  maxPull = 80,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const currentDelta = useRef(0);
  const pulling = useRef(false);
  const refreshing = useRef(false);

  const begin = useCallback((clientY: number) => {
    if (disabled || refreshing.current) return;
    if (window.scrollY > 0) return;
    startY.current = clientY;
    pulling.current = true;
    currentDelta.current = 0;
  }, [disabled]);

  const move = useCallback((clientY: number, preventDefault: () => void) => {
    if (!pulling.current || startY.current === null || refreshing.current) return;
    const raw = clientY - startY.current;
    if (raw <= 0) {
      pulling.current = false;
      setPullDistance(0);
      return;
    }
    preventDefault();
    const clamped = Math.min(raw * 0.55, maxPull);
    currentDelta.current = clamped;
    setPullDistance(clamped);
  }, [maxPull]);

  const end = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    const delta = currentDelta.current;
    currentDelta.current = 0;
    if (delta >= threshold) {
      refreshing.current = true;
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        refreshing.current = false;
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientY, () => e.preventDefault());
    const onTouchEnd = () => end();

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, begin, move, end]);

  return { pullDistance, isRefreshing };
}
