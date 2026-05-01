/**
 * Client-Side In-Memory Cache Store
 * Strategy: Stale-While-Revalidate
 *  - First visit  → fetch from API, store in cache
 *  - Next visit   → return cached data instantly (no loading spinner)
 *                   then silently re-fetch in background
 *  - If new data differs → update UI automatically
 *  - On any mutation (add/edit/delete) → invalidate related cache keys
 */

const cache = new Map();

// Default TTL: 5 minutes (after this, background re-fetch always happens)
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const cacheStore = {
  /**
   * Get cached value. Returns null if not found or expired.
   */
  get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    // Hard expiry — discard completely after 2x TTL
    if (Date.now() > entry.expiresAt + DEFAULT_TTL_MS) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },

  /**
   * Set a value in cache.
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    cache.set(key, {
      data,
      storedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  },

  /**
   * Check if the cache is stale (past TTL) but not hard-expired.
   * Stale = show cached, but trigger background refresh.
   */
  isStale(key) {
    const entry = cache.get(key);
    if (!entry) return true;
    return Date.now() > entry.expiresAt;
  },

  /**
   * Invalidate (delete) all cache keys that include the given pattern.
   * Call this after any mutation (create/update/delete).
   */
  invalidate(pattern) {
    for (const key of cache.keys()) {
      if (!pattern || key.includes(pattern)) {
        cache.delete(key);
      }
    }
  },

  /** Clear everything */
  clear() {
    cache.clear();
  },
};

export default cacheStore;
