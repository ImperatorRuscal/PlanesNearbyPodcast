const { AudioStore } = require('../src/services/audioStore');

describe('AudioStore', () => {
  test('getPromise returns null for unknown key', () => {
    const store = new AudioStore(5000);
    expect(store.getPromise('1.2.3.4', 1)).toBeNull();
  });

  test('setPromise and getPromise round-trip', () => {
    const store = new AudioStore(5000);
    const p = Promise.resolve(Buffer.from('mp3'));
    store.setPromise('1.2.3.4', 1, p);
    expect(store.getPromise('1.2.3.4', 1)).toBe(p);
  });

  test('getPromise returns null after TTL expires', () => {
    const store = new AudioStore(1); // 1ms TTL
    const p = Promise.resolve(Buffer.from('mp3'));
    store.setPromise('1.2.3.4', 1, p);
    // Force expire by backdating
    const key = '1.2.3.4:1';
    store._store.get(key).cachedAt -= 10;
    expect(store.getPromise('1.2.3.4', 1)).toBeNull();
  });

  test('hasAny returns false when no tracks stored for IP', () => {
    const store = new AudioStore(5000);
    expect(store.hasAny('1.2.3.4')).toBe(false);
  });

  test('hasAny returns true after any track is stored', () => {
    const store = new AudioStore(5000);
    store.setPromise('1.2.3.4', 3, Promise.resolve(Buffer.from('x')));
    expect(store.hasAny('1.2.3.4')).toBe(true);
  });

  test('hasAny returns false after all tracks for IP expire', () => {
    const store = new AudioStore(1);
    store.setPromise('1.2.3.4', 1, Promise.resolve(Buffer.from('x')));
    const key = '1.2.3.4:1';
    store._store.get(key).cachedAt -= 10;
    expect(store.hasAny('1.2.3.4')).toBe(false);
  });

  test('two getPromise calls before setPromise resolves share same promise', () => {
    const store = new AudioStore(5000);
    // Nothing stored yet — both calls return null; caller stores and both subsequent
    // calls return the SAME object.
    let resolve;
    const p = new Promise(r => { resolve = r; });
    store.setPromise('1.2.3.4', 2, p);
    const first  = store.getPromise('1.2.3.4', 2);
    const second = store.getPromise('1.2.3.4', 2);
    expect(first).toBe(second);
    resolve(Buffer.from('done'));
    return first; // promise resolves without error
  });

  test('sweep removes expired entries', () => {
    const store = new AudioStore(1);
    store.setPromise('1.2.3.4', 1, Promise.resolve(Buffer.from('x')));
    const key = '1.2.3.4:1';
    store._store.get(key).cachedAt -= 10;
    store.sweep();
    expect(store._store.has(key)).toBe(false);
  });
});
