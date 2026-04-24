/**
 * Cache Preloader
 * Preloads Firestore cache before app renders for instant data display
 * This runs before React hydration for zero-delay data availability
 */

import { firestoreCache } from './firestoreCache';

// Collections to preload with their TTLs (in milliseconds)
const PRELOAD_COLLECTIONS = {
  products: 30 * 60 * 1000,      // 30 minutes
  categories: 60 * 60 * 1000,    // 1 hour
  banners: 60 * 60 * 1000,       // 1 hour
  settings: 60 * 60 * 1000,      // 1 hour
  campaigns: 30 * 60 * 1000,    // 30 minutes
};

// Check if we have valid cached data
export function hasValidCache(): boolean {
  return PRELOAD_COLLECTIONS.hasOwnProperty(
    Object.keys(PRELOAD_COLLECTIONS)[0]
  ) && firestoreCache.getSync(PRELOAD_COLLECTIONS);
}

// Get all preloaded data synchronously
export function getPreloadedData<T>(collection: keyof typeof PRELOAD_COLLECTIONS): T | null {
  return firestoreCache.getSync<T>(collection);
}

// Mark cache as being refreshed in background
export function refreshCacheInBackground(collection: string, ttl: number): void {
  // This is called after Firebase data arrives
  // The actual refresh happens in the store subscriptions
}

// Initialize cache warmup (call early in index.html)
export function warmupCache(): void {
  // Pre-read cache keys to prime the browser's localStorage
  Object.keys(PRELOAD_COLLECTIONS).forEach(key => {
    try {
      const cached = localStorage.getItem(`fst_cache_${key}`);
      if (cached) {
        const entry = JSON.parse(cached);
        const age = Date.now() - entry.timestamp;
        if (age < PRELOAD_COLLECTIONS[key as keyof typeof PRELOAD_COLLECTIONS]) {
          console.log(`[Cache] ${key}: ${entry.data?.length || 0} items (${Math.round(age / 1000)}s old)`);
        }
      }
    } catch {
      // Ignore parse errors
    }
  });
}
