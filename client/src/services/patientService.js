import API from './api';
import cacheStore from './cacheStore';
import { parsePatientRef } from '../utils/patientUrl';

const KEYS = {
  all: 'patients:all',
  byId: (id) => `patients:${id}`,
};

export const patientService = {
  /**
   * Get all patients.
   * - Returns cached data instantly if available (no loading spinner).
   * - ALWAYS revalidates in background silently when onUpdate is provided.
   * - Calls onUpdate(newData) only if fresh data differs from cache.
   */
  getAll: async ({ onUpdate } = {}) => {
    const key = KEYS.all;
    const cached = cacheStore.get(key);

    if (cached) {
      // Return cached data immediately (instant, no loading spinner)
      if (onUpdate) {
        // ALWAYS revalidate in background — true stale-while-revalidate
        // This ensures bank info / updated data appears quickly
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

    // No cache → fetch fresh (only shows loading on first ever visit)
    const res = await API.get('/patients');
    cacheStore.set(key, res.data);
    return res.data;
  },

  /**
   * Get single patient by ID.
   * Same always-revalidate strategy.
   */
  getById: async (id, { onUpdate } = {}) => {
    const key = KEYS.byId(id);
    const cached = cacheStore.get(key);

    if (cached) {
      if (onUpdate) {
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

  getByRef: async (patientRef, { onUpdate } = {}) => {
    const parsed = parsePatientRef(patientRef);

    if (parsed.mode === 'token') {
      const refKey = KEYS.byId(`ref:${parsed.value}`);
      const cached = cacheStore.get(refKey);

      if (cached) {
        if (onUpdate) {
          API.get(`/patients/lookup/${parsed.value}`).then(res => {
            const fresh = res.data;
            if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
              cacheStore.set(refKey, fresh);
              cacheStore.set(KEYS.byId(fresh.id), fresh);
              onUpdate(fresh);
            }
          }).catch(() => {});
        }
        return cached;
      }

      const res = await API.get(`/patients/lookup/${parsed.value}`);
      cacheStore.set(refKey, res.data);
      cacheStore.set(KEYS.byId(res.data.id), res.data);
      return res.data;
    }

    if (!parsed.value) throw new Error('Invalid patient link');
    return patientService.getById(parsed.value, { onUpdate });
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
