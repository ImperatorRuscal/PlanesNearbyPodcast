# Podcast Audio Stream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/stream/*` Express router serving a fixed 21-track MP3 playlist for Yoto and similar static-playlist players, where aircraft narration tracks are generated on-demand via ElevenLabs TTS and cached in memory per client IP.

**Architecture:** A new `AudioStore` caches `Promise<Buffer>` objects per `ip:trackIndex` key so concurrent requests to the same track share one in-flight ElevenLabs API call. A thin `tts.js` wrapper calls ElevenLabs and returns a `Buffer`. The `stream.js` Express router handles all 21 track patterns — static files are served from disk, dynamic tracks trigger parallel TTS generation across all aircraft for that IP (fire-and-forget on first request, block per-track with 15s timeout).

**Tech Stack:** Node.js/Express, ElevenLabs REST API (`fetch`), Jest/supertest for tests.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/services/audioStore.js` | In-memory `Promise<Buffer>` cache, TTL + sweep |
| Create | `src/services/tts.js` | ElevenLabs API wrapper — `synthesize(text) → Promise<Buffer>` |
| Create | `src/routes/stream.js` | Express router for all 21 `/stream/*` patterns |
| Create | `scripts/setup-audio.js` | One-time script to generate static MP3s via ElevenLabs |
| Create | `public/audio/silence.mp3` | 1-second silence placeholder (committed binary) |
| Create | `tests/audioStore.test.js` | Unit tests for AudioStore |
| Create | `tests/tts.test.js` | Unit tests for synthesize() |
| Create | `tests/stream.test.js` | Route integration tests via supertest |
| Create | `tests/fixtures/audio/intro.mp3` | 1-byte MP3 placeholder for tests |
| Create | `tests/fixtures/audio/squelch.mp3` | 1-byte MP3 placeholder for tests |
| Create | `tests/fixtures/audio/silence.mp3` | 1-byte MP3 placeholder for tests |
| Modify | `src/server.js` | Mount stream router |
| Modify | `.env.example` | Add ElevenLabs variables |
| Modify | `CLAUDE.md` | Document new route and services |

---

## Task 1: AudioStore

**Files:**
- Create: `src/services/audioStore.js`
- Create: `tests/audioStore.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/audioStore.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=audioStore
```

Expected: FAIL — "Cannot find module '../src/services/audioStore'"

- [ ] **Step 3: Implement AudioStore**

Create `src/services/audioStore.js`:

```js
const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MS || '') || 5 * 60 * 1000;

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
    for (const [key, entry] of this._store) {
      if (!key.startsWith(prefix)) continue;
      if (now - entry.cachedAt < this.ttl) return true;
      this._store.delete(key);
    }
    return false;
  }

  sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now - entry.cachedAt >= this.ttl) this._store.delete(key);
    }
  }
}

const audioStore = new AudioStore();
module.exports = { AudioStore, audioStore };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=audioStore
```

Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/services/audioStore.js tests/audioStore.test.js
git commit -m "feat: add AudioStore — in-memory Promise<Buffer> cache for TTS tracks"
```

---

## Task 2: TTS Service

**Files:**
- Create: `src/services/tts.js`
- Create: `tests/tts.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/tts.test.js`:

```js
let fetchMock;

beforeEach(() => {
  jest.resetModules();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
  process.env.ELEVENLABS_API_KEY = 'test-key';
  process.env.ELEVENLABS_VOICE_IDS = 'voice-aaa,voice-bbb';
  process.env.ELEVENLABS_MODEL_ID = 'eleven_flash_v2_5';
  process.env.ELEVENLABS_SPEED = '1.0';
  process.env.ELEVENLABS_STABILITY = '0.45';
  process.env.ELEVENLABS_SIMILARITY = '0.80';
});

afterEach(() => {
  delete global.fetch;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_IDS;
  delete process.env.ELEVENLABS_MODEL_ID;
  delete process.env.ELEVENLABS_SPEED;
  delete process.env.ELEVENLABS_STABILITY;
  delete process.env.ELEVENLABS_SIMILARITY;
});

test('synthesize returns a Buffer on success', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  const result = await synthesize('Hello world');
  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test('synthesize calls ElevenLabs with correct request shape', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  await synthesize('Test text');

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/api\.elevenlabs\.io\/v1\/text-to-speech\//);
  expect(options.method).toBe('POST');
  expect(options.headers['xi-api-key']).toBe('test-key');
  expect(options.headers['Content-Type']).toBe('application/json');

  const body = JSON.parse(options.body);
  expect(body.text).toBe('Test text');
  expect(body.model_id).toBe('eleven_flash_v2_5');
  expect(body.voice_settings.stability).toBe(0.45);
  expect(body.voice_settings.similarity_boost).toBe(0.80);
  expect(body.voice_settings.speed).toBe(1.0);
});

test('synthesize picks a voice from VOICE_IDS (may be either)', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  await synthesize('Pick a voice');

  const [url] = fetchMock.mock.calls[0];
  expect(url).toMatch(/voice-aaa|voice-bbb/);
});

test('synthesize throws on non-ok response', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    status: 401,
    text: async () => 'Unauthorized',
  });

  const { synthesize } = require('../src/services/tts');
  await expect(synthesize('Hello')).rejects.toThrow('ElevenLabs API error 401');
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=tts
```

Expected: FAIL — "Cannot find module '../src/services/tts'"

- [ ] **Step 3: Implement tts.js**

Create `src/services/tts.js`:

```js
const VOICE_IDS = (process.env.ELEVENLABS_VOICE_IDS || 'cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const MODEL_ID    = process.env.ELEVENLABS_MODEL_ID  || 'eleven_flash_v2_5';
const SPEED       = parseFloat(process.env.ELEVENLABS_SPEED       || '1.0');
const STABILITY   = parseFloat(process.env.ELEVENLABS_STABILITY   || '0.45');
const SIMILARITY  = parseFloat(process.env.ELEVENLABS_SIMILARITY  || '0.80');

async function synthesize(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const voiceId = VOICE_IDS[Math.floor(Math.random() * VOICE_IDS.length)];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: STABILITY,
        similarity_boost: SIMILARITY,
        speed: SPEED,
      },
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`ElevenLabs API error ${res.status}: ${msg}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

module.exports = { synthesize };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=tts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/services/tts.js tests/tts.test.js
git commit -m "feat: add tts.js — ElevenLabs synthesize() wrapper with random voice selection"
```

---

## Task 3: Static Audio Assets and Setup Script

**Files:**
- Create: `scripts/setup-audio.js`
- Create: `public/audio/.gitkeep` (directory marker; real MP3s are git-ignored or committed)
- Create: `tests/fixtures/audio/intro.mp3`
- Create: `tests/fixtures/audio/squelch.mp3`
- Create: `tests/fixtures/audio/silence.mp3`

This task produces the static files that the stream router serves. The test fixtures are tiny 1-byte placeholders — just enough for `sendFile` to succeed in tests. The real `public/audio/` files are generated once by the setup script and committed as binary assets.

- [ ] **Step 1: Create test fixture audio files**

These are 1-byte placeholders. Create the directory and files:

```bash
mkdir -p tests/fixtures/audio
# Write minimal valid-looking MP3 header bytes so sendFile won't error
node -e "require('fs').writeFileSync('tests/fixtures/audio/intro.mp3',   Buffer.from([0xff,0xe0]))"
node -e "require('fs').writeFileSync('tests/fixtures/audio/squelch.mp3', Buffer.from([0xff,0xe0]))"
node -e "require('fs').writeFileSync('tests/fixtures/audio/silence.mp3', Buffer.from([0xff,0xe0]))"
```

- [ ] **Step 2: Create setup-audio.js**

This script is run once during development to generate the static assets. It should NOT be run in CI.

Create `scripts/setup-audio.js`:

```js
#!/usr/bin/env node
/**
 * One-time setup: generates public/audio/intro.mp3 and public/audio/silence.mp3
 * via ElevenLabs TTS. Run after cloning a new environment:
 *
 *   ELEVENLABS_API_KEY=xxx node scripts/setup-audio.js
 *
 * public/audio/squelch.mp3 must be sourced manually from a royalty-free audio
 * library and placed in public/audio/ before running the server.
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { synthesize } = require('../src/services/tts');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

const ASSETS = [
  {
    file: 'intro.mp3',
    text: 'Welcome to Planes Nearby. Scanning the skies above you now — here\'s what\'s up there.',
  },
  {
    file: 'silence.mp3',
    // Synthesize near-silence: ElevenLabs minimum billing unit, just whitespace.
    text: ' ',
  },
];

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY is not set.');
    process.exit(1);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  for (const asset of ASSETS) {
    const dest = path.join(AUDIO_DIR, asset.file);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${asset.file} — already exists`);
      continue;
    }
    console.log(`Generating ${asset.file}...`);
    const buf = await synthesize(asset.text);
    fs.writeFileSync(dest, buf);
    console.log(`  Written ${buf.length} bytes to ${dest}`);
  }

  const squelchPath = path.join(AUDIO_DIR, 'squelch.mp3');
  if (!fs.existsSync(squelchPath)) {
    console.warn('\nWARNING: public/audio/squelch.mp3 is missing.');
    console.warn('Source a royalty-free radio squelch sound and place it at that path.');
  }

  console.log('\nDone. Commit public/audio/*.mp3 to the repository.');
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Add public/audio to .gitignore exclusion list (or verify it's tracked)**

The `public/audio/` directory should be tracked (binary assets committed). Verify `.gitignore` does not exclude it:

```bash
git check-ignore -v public/audio/
```

Expected: no output (not ignored). If it is ignored, remove the offending rule.

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-audio.js tests/fixtures/audio/
git commit -m "feat: add setup-audio.js one-time generator and test fixture MP3 placeholders"
```

---

## Task 4: Stream Router

**Files:**
- Create: `src/routes/stream.js`
- Create: `tests/stream.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/stream.test.js`:

```js
const path    = require('path');
const request = require('supertest');
const express = require('express');

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockBuildAircraftData = jest.fn();
const mockSynthesize        = jest.fn();
const mockClientIp          = jest.fn(() => '1.2.3.4');

jest.mock('../src/services/audioStore', () => {
  const { AudioStore } = jest.requireActual('../src/services/audioStore');
  return { audioStore: new AudioStore(5 * 60 * 1000) };
});

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'audio');

function makeApp() {
  const { createStreamRouter } = require('../src/routes/stream');
  const { audioStore }         = require('../src/services/audioStore');
  const app = express();
  app.use('/stream', createStreamRouter({
    buildAircraftData: mockBuildAircraftData,
    clientIp:          mockClientIp,
    audioStore,
    synthesize:        mockSynthesize,
    audioDir:          FIXTURE_DIR,
  }));
  return app;
}

const MOCK_DATA = {
  aircraft: [
    { script: 'A Delta flight is nearby.' },
    { script: 'A Southwest flight is nearby.' },
    { script: 'A private plane is nearby.' },
  ],
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockBuildAircraftData.mockResolvedValue(MOCK_DATA);
  mockSynthesize.mockResolvedValue(Buffer.from([0xff, 0xe0]));
});

// ── Static tracks ──────────────────────────────────────────────────────────

test('GET /stream/intro.mp3 serves fixture file', async () => {
  const app = makeApp();
  const res = await request(app).get('/stream/intro.mp3');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/audio|octet/);
});

test('GET /stream/silence.mp3 serves fixture file', async () => {
  const app = makeApp();
  const res = await request(app).get('/stream/silence.mp3');
  expect(res.status).toBe(200);
});

// ── Squelch tracks ─────────────────────────────────────────────────────────

test('GET /stream/squelch-1.mp3 serves squelch when aircraft exist', async () => {
  const app = makeApp();
  const res = await request(app).get('/stream/squelch-1.mp3');
  expect(res.status).toBe(200);
  // 3 aircraft → squelch-1, squelch-2, squelch-3 are real; should NOT be silence
  // We can't distinguish silence vs squelch by content in unit tests,
  // but a 200 with audio content-type is the contract.
  expect(res.headers['content-type']).toMatch(/audio|octet/);
});

test('GET /stream/squelch-5.mp3 serves silence when N > aircraft count', async () => {
  const app = makeApp();
  // Only 3 aircraft, so squelch-5 (index 5) should be silence
  const res = await request(app).get('/stream/squelch-5.mp3');
  expect(res.status).toBe(200);
});

// ── Aircraft TTS tracks ────────────────────────────────────────────────────

test('GET /stream/aircraft-1.mp3 returns audio buffer from synthesize', async () => {
  const app = makeApp();
  const res = await request(app).get('/stream/aircraft-1.mp3');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/audio|octet/);
  expect(mockSynthesize).toHaveBeenCalled();
});

test('GET /stream/aircraft-5.mp3 returns silence when N > aircraft count', async () => {
  const app = makeApp();
  const res = await request(app).get('/stream/aircraft-5.mp3');
  expect(res.status).toBe(200);
  // synthesize should NOT have been called for the silence track
  // (it may have been called for tracks 1-3, but not for track 5)
  const calls = mockSynthesize.mock.calls.length;
  // All valid aircraft (1-3) might trigger synthesis; track 5 should not add another
  expect(calls).toBeLessThanOrEqual(3);
});

test('GET /stream/aircraft-2.mp3 uses cached promise on second request', async () => {
  const app = makeApp();
  await request(app).get('/stream/aircraft-1.mp3');
  const callsAfterFirst = mockSynthesize.mock.calls.length;
  await request(app).get('/stream/aircraft-2.mp3');
  const callsAfterSecond = mockSynthesize.mock.calls.length;
  // Second request should not trigger new synthesis (already cached)
  expect(callsAfterSecond).toBe(callsAfterFirst);
});

test('GET /stream/aircraft-1.mp3 returns silence when synthesize rejects', async () => {
  mockSynthesize.mockRejectedValue(new Error('ElevenLabs down'));
  const app = makeApp();
  const res = await request(app).get('/stream/aircraft-1.mp3');
  expect(res.status).toBe(200);
  // Should fall back to silence, not a 500
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=stream
```

Expected: FAIL — "Cannot find module '../src/routes/stream'"

- [ ] **Step 3: Implement stream.js**

Create `src/routes/stream.js`:

```js
const express = require('express');
const path    = require('path');

const TRACK_TIMEOUT_MS = 15_000;

/**
 * Factory function to avoid circular imports with server.js.
 *
 * @param {object} deps
 * @param {Function} deps.buildAircraftData  (ip) => Promise<{aircraft}>
 * @param {Function} deps.clientIp           (req) => string
 * @param {object}   deps.audioStore         AudioStore singleton
 * @param {Function} deps.synthesize         (text) => Promise<Buffer>
 * @param {string}   deps.audioDir           absolute path to directory with intro/squelch/silence MP3s
 */
function createStreamRouter({ buildAircraftData, clientIp, audioStore, synthesize, audioDir }) {
  const router = express.Router();

  function sendAudio(res, filePath) {
    res.sendFile(filePath, { headers: { 'Content-Type': 'audio/mpeg' } }, err => {
      if (err && !res.headersSent) res.status(500).end();
    });
  }

  function sendSilence(res) {
    sendAudio(res, path.join(audioDir, 'silence.mp3'));
  }

  /**
   * Fires TTS synthesis for all aircraft for this IP (once per TTL window).
   * Stores Promise<Buffer> in audioStore BEFORE awaiting, so concurrent requests
   * for the same IP share the same in-flight call.
   */
  function ensureGenerated(ip, aircraft) {
    if (audioStore.hasAny(ip)) return; // already generating or cached

    aircraft.forEach((a, i) => {
      const trackIndex = i + 1;
      const promise = synthesize(a.script).catch(err => {
        console.warn(`[stream] TTS failed for ${ip} track ${trackIndex}:`, err.message);
        return null; // null sentinel → serve silence
      });
      audioStore.setPromise(ip, trackIndex, promise);
    });
  }

  // ── GET /stream/intro.mp3 ────────────────────────────────────────────────
  router.get('/intro.mp3', (_req, res) => {
    sendAudio(res, path.join(audioDir, 'intro.mp3'));
  });

  // ── GET /stream/silence.mp3 ──────────────────────────────────────────────
  router.get('/silence.mp3', (_req, res) => {
    sendSilence(res);
  });

  // ── GET /stream/squelch-:n.mp3 ───────────────────────────────────────────
  router.get('/squelch-:n.mp3', async (req, res) => {
    const n = parseInt(req.params.n, 10);
    if (!n || n < 1 || n > 10) return sendSilence(res);

    const ip = clientIp(req);
    let aircraft = [];
    try {
      const data = await buildAircraftData(ip);
      aircraft = data.aircraft || [];
    } catch (err) {
      console.error('[stream] buildAircraftData error:', err.message);
      return sendSilence(res);
    }

    if (n > aircraft.length) return sendSilence(res);
    sendAudio(res, path.join(audioDir, 'squelch.mp3'));
  });

  // ── GET /stream/aircraft-:n.mp3 ─────────────────────────────────────────
  router.get('/aircraft-:n.mp3', async (req, res) => {
    const n = parseInt(req.params.n, 10);
    if (!n || n < 1 || n > 10) return sendSilence(res);

    const ip = clientIp(req);
    let aircraft = [];
    try {
      const data = await buildAircraftData(ip);
      aircraft = data.aircraft || [];
    } catch (err) {
      console.error('[stream] buildAircraftData error:', err.message);
      return sendSilence(res);
    }

    if (n > aircraft.length) return sendSilence(res);

    // Fire TTS generation for all aircraft (no-op if already running/cached)
    ensureGenerated(ip, aircraft);

    // Await the specific track's promise with a timeout
    let buf = null;
    try {
      const promise = audioStore.getPromise(ip, n);
      if (promise) {
        buf = await Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TTS timeout')), TRACK_TIMEOUT_MS)
          ),
        ]);
      }
    } catch (err) {
      console.warn(`[stream] Timeout or error awaiting track ${n} for ${ip}:`, err.message);
    }

    if (!buf) return sendSilence(res);

    res.set('Content-Type', 'audio/mpeg');
    res.send(buf);
  });

  return router;
}

module.exports = { createStreamRouter };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=stream
```

Expected: PASS — 8 tests

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npm test
```

Expected: all existing tests still pass

- [ ] **Step 6: Commit**

```bash
git add src/routes/stream.js tests/stream.test.js
git commit -m "feat: add stream router — 21-track /stream/* endpoint with TTS generation and AudioStore caching"
```

---

## Task 5: Wire Up and Documentation

**Files:**
- Modify: `src/server.js`
- Modify: `.env.example`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Mount stream router in server.js**

In `src/server.js`, add after the existing `require` statements at the top:

```js
const { createStreamRouter } = require('./routes/stream');
const { audioStore }         = require('./services/audioStore');
const { synthesize }         = require('./services/tts');
```

Then mount the router — add this block after `app.use(express.static(...))` and before the health route:

```js
// ── Stream router ─────────────────────────────────────────────────────────
const audioDir = path.join(__dirname, '..', 'public', 'audio');
app.use('/stream', createStreamRouter({ buildAircraftData, clientIp, audioStore, synthesize, audioDir }));
```

Note: `buildAircraftData` and `clientIp` are defined later in the file via function declarations, which are hoisted — this is safe.

- [ ] **Step 2: Run the existing test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 3: Update .env.example**

In `.env.example`, add after the existing lines:

```
# ElevenLabs TTS (https://elevenlabs.io — create a free/starter account, copy API key from Profile)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_IDS=cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_SPEED=1.0
ELEVENLABS_STABILITY=0.45
ELEVENLABS_SIMILARITY=0.80
```

- [ ] **Step 4: Update CLAUDE.md**

In the **Architecture** section, add these entries to the bullet list:

```
- `src/routes/stream.js` — `/stream/*` router; 21 track patterns; factory `createStreamRouter({buildAircraftData, clientIp, audioStore, synthesize, audioDir})`
- `src/services/audioStore.js` — In-memory `Promise<Buffer>` cache keyed by `ip:trackIndex`; TTL matches flight cache; `getPromise`, `setPromise`, `hasAny`, `sweep`
- `src/services/tts.js` — ElevenLabs TTS wrapper; `synthesize(text) → Promise<Buffer>`; random voice per call from `ELEVENLABS_VOICE_IDS` array
```

In the **Environment Variables** table, add:

```
| `ELEVENLABS_API_KEY` | Yes (for /stream) | ElevenLabs dashboard — Profile → API Keys |
| `ELEVENLABS_VOICE_IDS` | No | Comma-separated voice IDs; one chosen at random per TTS call. Default: Marty (AU) + Johnny Texas (TX) |
| `ELEVENLABS_MODEL_ID` | No | Default: `eleven_flash_v2_5` |
| `ELEVENLABS_SPEED` | No | Default: `1.0` |
| `ELEVENLABS_STABILITY` | No | Default: `0.45` |
| `ELEVENLABS_SIMILARITY` | No | Default: `0.80` |
```

In the **Key Behaviours** section, add:

```
- `/stream/intro.mp3` — static welcome narration; `/stream/squelch-N.mp3` — static squelch sound or silence; `/stream/aircraft-N.mp3` — TTS-generated aircraft narration, cached per IP with 5-min TTL, 15s timeout → silence fallback
- First request to any `/stream/aircraft-N.mp3` for a given IP fires TTS synthesis for ALL aircraft in parallel; subsequent requests within TTL window await the same cached promises
```

- [ ] **Step 5: Final full test run**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/server.js .env.example CLAUDE.md
git commit -m "feat: wire stream router into server, update env vars and docs"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|------------|
| 21-track playlist with intro, squelch-N, aircraft-N, silence patterns | Task 4 stream router |
| Static tracks served from disk immediately | Task 4 — `sendFile` for intro/squelch/silence |
| Aircraft tracks generate via ElevenLabs, cached per IP | Task 4 — `ensureGenerated()` + AudioStore |
| Silence served when N > aircraft count | Task 4 — `if (n > aircraft.length)` check |
| Promise-based cache (concurrent requests share one in-flight call) | Task 1 AudioStore, Task 4 |
| `ELEVENLABS_VOICE_IDS` comma-separated, random selection per call | Task 2 tts.js |
| 15-second timeout → silence fallback | Task 4 — `Promise.race` with setTimeout |
| Factory function pattern to avoid circular imports | Task 4 — `createStreamRouter({...})` |
| `audioStore.hasAny(ip)` to prevent double-firing synthesis | Task 1 + Task 4 |
| `ELEVENLABS_API_KEY` required, clear error if missing | Task 2 tts.js throws on missing key |
| Static assets in `public/audio/` | Task 3 |
| One-time setup script for intro.mp3 and silence.mp3 | Task 3 setup-audio.js |
| `.env.example` updated | Task 5 |
| `CLAUDE.md` updated | Task 5 |
| Tests for audioStore, tts, stream | Tasks 1, 2, 4 |

### No gaps found.

### Type/method consistency check

- `audioStore.getPromise(ip, n)` — defined in Task 1, used in Task 4. ✓
- `audioStore.setPromise(ip, n, promise)` — defined in Task 1, used in Task 4. ✓
- `audioStore.hasAny(ip)` — defined in Task 1, used in Task 4. ✓
- `synthesize(text)` — defined in Task 2, used in Tasks 3 and 4. ✓
- `createStreamRouter({ buildAircraftData, clientIp, audioStore, synthesize, audioDir })` — defined in Task 4, wired in Task 5. ✓

### No placeholder language found.
