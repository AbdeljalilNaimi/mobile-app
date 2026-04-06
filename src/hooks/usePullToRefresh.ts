import { useState, useCallback, useEffect, useRef, type RefObject } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

interface UsePullToRefreshResult<T extends HTMLElement> {
  ref: RefObject<T>;
  pullDistance: number;
  isRefreshing: boolean;
}

/**
 * usePullToRefresh — pull-to-refresh gesture hook with container ref support.
 *
 * Returns a `ref` to attach to the scroll container. Events are bound to
 * that element (or document as fallback).
 *
 * Scroll-top detection:
 *   - If the attached element is a real scroll container (scrollHeight > clientHeight),
 *     uses element.scrollTop === 0.
 *   - Otherwise (full-page scroll like MobileHomeScreen), falls back to window.scrollY === 0.
 *
 * Supports both touch (mobile) and mouse (desktop debug) gestures.
 */
export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>({
  onRefresh,
  threshold = 72,
  maxPull = 80,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult<T> {
  const containerRef = useRef<T>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const currentDelta = useRef(0);
  const pulling = useRef(false);
  const refreshing = useRef(false);
  const mouseDown = useRef(false);

  const isAtTop = useCallback((): boolean => {
    const el = containerRef.current;
    if (!el) return window.scrollY <= 0;
    if (el.scrollHeight > el.clientHeight) {
      return el.scrollTop <= 0;
    }
    return window.scrollY <= 0;
  }, []);

  const begin = useCallback((clientY: number) => {
    if (disabled || refreshing.current || !isAtTop()) return;
    startY.current = clientY;
    pulling.current = true;
    currentDelta.current = 0;
  }, [disabled, isAtTop]);

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
    mouseDown.current = false;
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
    const target: EventTarget = containerRef.current ?? document;

    const onTouchStart = (e: Event) => begin((e as TouchEvent).touches[0].clientY);
    const onTouchMove = (e: Event) => move((e as TouchEvent).touches[0].clientY, () => e.preventDefault());
    const onTouchEnd = () => end();

    const onMouseDown = (e: Event) => {
      if ((e as MouseEvent).button !== 0) return;
      mouseDown.current = true;
      begin((e as MouseEvent).clientY);
    };
    const onMouseMove = (e: Event) => {
      if (!mouseDown.current) return;
      move((e as MouseEvent).clientY, () => {});
    };
    const onMouseUp = () => { mouseDown.current = false; end(); };
    const onMouseLeave = () => { mouseDown.current = false; end(); };

    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: false });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('mousemove', onMouseMove);
    target.addEventListener('mouseup', onMouseUp);
    target.addEventListener('mouseleave', onMouseLeave);

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('mousemove', onMouseMove);
      target.removeEventListener('mouseup', onMouseUp);
      target.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [disabled, begin, move, end]);

  return { ref: containerRef, pullDistance, isRefreshing };
}
