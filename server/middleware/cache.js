const memoryCache = new Map();

const cacheMiddleware = (duration) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') return next();

  const key = `__express__${req.originalUrl || req.url}`;
  const cachedResponse = memoryCache.get(key);

  if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
    return res.json(cachedResponse.data);
  }

  const originalJson = res.json;
  res.json = (body) => {
    memoryCache.set(key, { data: body, expiresAt: Date.now() + duration * 1000 });
    originalJson.call(res, body);
  };
  next();
};

const clearCache = (pattern) => {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) memoryCache.delete(key);
  }
};

module.exports = { cacheMiddleware, clearCache };
