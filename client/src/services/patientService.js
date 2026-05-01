import API from './api';
import cacheStore from './cacheStore';

const KEYS = {
  all: 'patients:all',
  byId: (id) => `patients:${id}`,
};

export const patientService = {
  /**
   * Get all patients.
   * - Returns cached data instantly if available (no loading spinner).
   * - Silently re-fetches in background if cache is stale.
   * - Calls onUpdate(newData) if fresh data differs from cache.
   */
  getAll: async ({ onUpdate } = {}) => {
    const key = KEYS.all;
    const cached = cacheStore.get(key);

    if (cached) {
      // Return cached data immediately (instant, no loading)
      if (cacheStore.isStale(key) && onUpdate) {
        // Background revalidation — don't await, don't block UI
        API.get('/patients').then(res => {
          const fresh = res.data;
          // Only update UI if data actually changed
          if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
            cacheStore.set(key, fresh);
            onUpdate(fresh);
          }
        }).catch(() => {}); // Silently ignore background errors
      }
      return cached;
    }

    // No cache → fetch fresh, show loading once
    const res = await API.get('/patients');
    cacheStore.set(key, res.data);
    return res.data;
  },

  /**
   * Get single patient by ID.
   * Same stale-while-revalidate strategy.
   */
  getById: async (id, { onUpdate } = {}) => {
    const key = KEYS.byId(id);
    const cached = cacheStore.get(key);

    if (cached) {
      if (cacheStore.isStale(key) && onUpdate) {
        API.get(`/patients/${id}`).then(res => {
          const fresh = res.data;
          if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
            cacheStore.set(key, fresh);
            onUpdate(fresh);
          }
        }).catch(() => {});
      }
      return cached;
    }

    const res = await API.get(`/patients/${id}`);
    cacheStore.set(key, res.data);
    return res.data;
  },

  /** Mutations: always invalidate cache so next load is fresh */
  create: async (data) => {
    const res = await API.post('/patients', data);
    cacheStore.invalidate('patients');
    return res.data;
  },

  update: async (id, data) => {
    const res = await API.put(`/patients/${id}`, data);
    cacheStore.invalidate('patients');
    return res.data;
  },

  delete: async (id) => {
    const res = await API.delete(`/patients/${id}`);
    cacheStore.invalidate('patients');
    return res.data;
  },

  /** Force-clear all patient cache (call after admin dashboard saves) */
  invalidateAll: () => cacheStore.invalidate('patients'),
};
