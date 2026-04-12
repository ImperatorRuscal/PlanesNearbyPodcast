const { Cache } = require('../src/cache');

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new Cache(5000); // 5 second TTL for tests
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns null for missing key', () => {
    expect(cache.get('missing')).toBeNull();
  });

  test('returns stored data for valid key', () => {
    cache.set('key1', { foo: 'bar' });
    expect(cache.get('key1')).toEqual({ foo: 'bar' });
  });

  test('returns null after TTL expires', () => {
    cache.set('key1', { foo: 'bar' });
    jest.advanceTimersByTime(6000);
    expect(cache.get('key1')).toBeNull();
  });

  test('returns data just before TTL expires', () => {
    cache.set('key1', { foo: 'bar' });
    jest.advanceTimersByTime(4999);
    expect(cache.get('key1')).toEqual({ foo: 'bar' });
  });

  test('getMetadata returns cachedAt and expiresAt', () => {
    const before = Date.now();
    cache.set('key1', { foo: 'bar' });
    const meta = cache.getMetadata('key1');
    expect(meta.cachedAt).toBeGreaterThanOrEqual(before);
    expect(meta.expiresAt).toBe(meta.cachedAt + 5000);
  });

  test('getMetadata returns null for missing key', () => {
    expect(cache.getMetadata('missing')).toBeNull();
  });

  test('clear() removes all entries', () => {
    cache.set('k1', 1);
    cache.set('k2', 2);
    cache.clear();
    expect(cache.get('k1')).toBeNull();
    expect(cache.get('k2')).toBeNull();
  });

  test('sweep() removes only expired entries', () => {
    cache.set('fresh', 'data');
    jest.advanceTimersByTime(2000);
    cache.set('newer', 'data2');
    jest.advanceTimersByTime(4000);
    cache.sweep();
    expect(cache.get('fresh')).toBeNull();
    expect(cache.get('newer')).toEqual('data2');
  });
});
