const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MS || '') || 10 * 60 * 1000;

class AudioStore {
  constructor(ttlMs = CACHE_TTL_MS) {
    this.ttl = ttlMs;
    this._store = new Map(); // "ip:trackIndex" -> { promise, cachedAt }
    this._sweepInterval = setInterval(() => this.sweep(), 10 * 60 * 1000);
    this._sweepInterval.unref();
  }

  _key(ip, trackIndex) {
    return `${ip}:${trackIndex}`;
  }

  getPromise(ip, trackIndex) {
    const key = this._key(ip, trackIndex);
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt >= this.ttl) {
      this._store.delete(key);
      return null;
    }
    return entry.promise;
  }

  setPromise(ip, trackIndex, promise) {
    this._store.set(this._key(ip, trackIndex), { promise, cachedAt: Date.now() });
  }

  hasAny(ip) {
    const prefix = `${ip}:`;
    const now = Date.now();
    let found = false;
    for (const [key, entry] of this._store) {
      if (!key.startsWith(prefix)) continue;
      if (now - entry.cachedAt < this.ttl) {
        found = true; // do NOT break — continue to evict remaining expired siblings
      } else {
        this._store.delete(key);
      }
    }
    return found;
  }

  sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now - entry.cachedAt >= this.ttl) this._store.delete(key);
    }
  }

  clear() {
    this._store.clear();
  }
}

const audioStore = new AudioStore();
module.exports = { AudioStore, audioStore };
