/**
 * CacheService — TTL-aware localStorage wrapper for critical app data.
 *
 * Provides typed helpers for providers and ads with explicit TTLs.
 * A CACHE_VERSION bump automatically clears stale cache from old schemas.
 */

import { CityHealthProvider } from '@/data/providers';
import type { HomepageAd } from '@/hooks/useHomepageData';

const CACHE_VERSION = 1;
const VERSION_KEY = 'ch_cache_version';

const TTL = {
  providers: 3 * 60 * 60 * 1000,   // 3 hours
  emergency: 30 * 60 * 1000,        // 30 minutes (critical data)
  homepageAds: 60 * 60 * 1000,      // 1 hour
};

interface CacheEntry<T> {
  data: T;
  savedAt: number;
  ttl: number;
}

function clearVersionedCache() {
  const stored = localStorage.getItem(VERSION_KEY);
  if (stored !== String(CACHE_VERSION)) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('ch_cache_'));
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, String(CACHE_VERSION));
  }
}

function save<T>(key: string, data: T, ttl: number): void {
  try {
    clearVersionedCache();
    const entry: CacheEntry<T> = { data, savedAt: Date.now(), ttl };
    localStorage.setItem(`ch_cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn('[CacheService] Failed to save:', key, e);
  }
}

function load<T>(key: string): T | null {
  try {
    clearVersionedCache();
    const raw = localStorage.getItem(`ch_cache_${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.savedAt > entry.ttl) {
      localStorage.removeItem(`ch_cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function getCachedAt(key: string): Date | null {
  try {
    const raw = localStorage.getItem(`ch_cache_${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return new Date(entry.savedAt);
  } catch {
    return null;
  }
}

function invalidate(key: string): void {
  localStorage.removeItem(`ch_cache_${key}`);
}

// ── Typed helpers ──────────────────────────────────────────────

export const cacheService = {
  saveProviders(data: CityHealthProvider[]) {
    save('verified_providers', data, TTL.providers);
  },
  loadProviders(): CityHealthProvider[] | null {
    return load<CityHealthProvider[]>('verified_providers');
  },
  providersLastUpdated(): Date | null {
    return getCachedAt('verified_providers');
  },
  invalidateProviders() {
    invalidate('verified_providers');
  },

  saveEmergencyProviders(data: CityHealthProvider[]) {
    save('emergency_providers', data, TTL.emergency);
  },
  loadEmergencyProviders(): CityHealthProvider[] | null {
    return load<CityHealthProvider[]>('emergency_providers');
  },

  saveHomepageAds(data: HomepageAd[]) {
    save('homepage_ads', data, TTL.homepageAds);
  },
  loadHomepageAds(): HomepageAd[] | null {
    return load<HomepageAd[]>('homepage_ads');
  },
  homepageAdsLastUpdated(): Date | null {
    return getCachedAt('homepage_ads');
  },
};
