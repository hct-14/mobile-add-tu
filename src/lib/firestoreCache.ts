/**
 * Firestore Cache Manager
 * Cache Firestore data in localStorage for instant subsequent loads
 * Supports preloading before Firebase initialization
 */

const CACHE_PREFIX = 'fst_cache_'; // Shorter prefix for faster serialization
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FirestoreCache {
  private storage: Storage;
  private cacheReady = false;

  constructor() {
    this.storage = localStorage;
    // Mark cache as ready for immediate reads
    this.cacheReady = true;
  }

  /**
   * Generate cache key from collection name
   */
  private getCacheKey(collection: string): string {
    return `${CACHE_PREFIX}${collection}`;
  }

  /**
   * Get cached data synchronously - for instant load before Firebase
   * Returns null only if: no cache, expired, or parse error
   */
  getSync<T>(collection: string): T | null {
    if (!this.cacheReady) return null;
    
    try {
      const key = this.getCacheKey(collection);
      const cached = this.storage.getItem(key);
      
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if expired (using timestamp + ttl)
      if (now - entry.timestamp > entry.ttl) {
        this.storage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  /**
   * Async version for background refresh
   */
  get<T>(collection: string): Promise<T | null> {
    return Promise.resolve(this.getSync<T>(collection));
  }

  /**
   * Store data in cache
   */
  set<T>(collection: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const key = this.getCacheKey(collection);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      const serialized = JSON.stringify(entry);
      
      // Check size before storing
      if (serialized.length > MAX_CACHE_SIZE) {
        console.warn('Cache entry too large, skipping:', collection);
        return;
      }
      
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.warn('Firestore cache set error:', error);
      this.clearOldest();
    }
  }

  /**
   * Clear oldest cache entries when storage is full
   */
  private clearOldest(): void {
    const keys = Object.keys(this.storage).filter(k => k.startsWith(CACHE_PREFIX));
    const entries: { key: string; timestamp: number }[] = [];

    keys.forEach(key => {
      try {
        const entry: CacheEntry<unknown> = JSON.parse(this.storage.getItem(key) || '');
        entries.push({ key, timestamp: entry.timestamp });
      } catch {
        this.storage.removeItem(key);
      }
    });

    // Sort by timestamp and remove oldest 50%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length / 2);
    
    for (let i = 0; i < toRemove; i++) {
      this.storage.removeItem(entries[i].key);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    const keys = Object.keys(this.storage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(key => this.storage.removeItem(key));
  }

  /**
   * Clear specific collection cache
   */
  clearCollection(collection: string): void {
    this.storage.removeItem(this.getCacheKey(collection));
  }
}

export const firestoreCache = new FirestoreCache();
