class Cache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttl = ttlMs;
    this.store = new Map(); // key -> { data, cachedAt }
    this._sweepInterval = setInterval(() => this.sweep(), 10 * 60 * 1000);
    this._sweepInterval.unref();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt >= this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, cachedAt: Date.now() });
  }

  getMetadata(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt >= this.ttl) {
      this.store.delete(key);
      return null;
    }
    return { cachedAt: entry.cachedAt, expiresAt: entry.cachedAt + this.ttl };
  }

  sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.cachedAt >= this.ttl) this.store.delete(key);
    }
  }

  clear() {
    this.store.clear();
  }
}

module.exports = { Cache };
