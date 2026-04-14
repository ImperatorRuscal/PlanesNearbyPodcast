# Podcast Audio Stream — Design Spec

**Date:** 2026-04-14  
**Feature:** `/stream/*` endpoint serving a 21-track personalized audio playlist for Yoto and similar static-playlist players.

---

## Goal

Serve a fixed 21-track audio playlist where each Yoto player's public IP is geolocated to produce a personalized "sky scanner" narration of nearby aircraft. Static tracks (intro, squelch, silence) are served immediately from disk; dynamic aircraft narration tracks are generated via ElevenLabs TTS on first request, cached in memory, and served to all subsequent requests within the cache window.

---

## Architecture

### Playlist Structure (21 tracks, submitted once to Yoto)

| Track # | URL | Type |
|---------|-----|------|
| 1 | `/stream/intro.mp3` | Static — generic welcome narration |
| 2 | `/stream/squelch-1.mp3` | Static — radio squelch sound (or silence if 0 aircraft) |
| 3 | `/stream/aircraft-1.mp3` | Dynamic TTS — aircraft 1 script |
| 4 | `/stream/squelch-2.mp3` | Static or silence |
| 5 | `/stream/aircraft-2.mp3` | Dynamic TTS — aircraft 2 script |
| … | … | … |
| 20 | `/stream/squelch-10.mp3` | Static or silence |
| 21 | `/stream/aircraft-10.mp3` | Dynamic TTS — aircraft 10 script |

**Silence rule:** For any squelch-N or aircraft-N track where N exceeds the number of aircraft returned for that IP, the server returns `public/audio/silence.mp3`. Under normal conditions only 3–5 aircraft are returned; tracks 6–21 will almost always be silence.

### Request Flow

```
Yoto player → GET /stream/aircraft-3.mp3
                ↓
           clientIp(req)                    (same helper as web routes)
                ↓
      audioStore.getPromise(ip, 3)
         ↙ cache hit          ↘ cache miss
    serve Buffer          buildAircraftData(ip)
                               ↓
                    fire all N ElevenLabs requests in parallel
                    store Promise<Buffer> for each in audioStore
                               ↓
                    await promise for track 3 (timeout: 15s → silence)
                               ↓
                          serve Buffer
```

Any of the 21 track requests can trigger generation — the first request wins, subsequent requests for the same IP await the same promises.

---

## New Files

### `src/services/tts.js`

ElevenLabs API wrapper. Entirely config-driven — callers pass a text string and receive a `Buffer` (MP3). No ElevenLabs-specific details leak outside this file.

```js
// Config (all overridable via env vars):
ELEVENLABS_VOICE_IDS     // default: "cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ"
                         // comma-separated list; parsed to array at startup
                         // one voice is chosen at random per synthesize() call
                         // single entry = always that voice
ELEVENLABS_MODEL_ID      // default: eleven_flash_v2_5
ELEVENLABS_SPEED         // default: 1.0
ELEVENLABS_STABILITY     // default: 0.45
ELEVENLABS_SIMILARITY    // default: 0.80

// Exported function:
async function synthesize(text: string): Promise<Buffer>
// Internally picks a random voice from the parsed VOICE_IDS array each call.
```

To swap TTS providers later: replace the body of `synthesize()` only. The interface stays the same.

### `src/services/audioStore.js`

In-memory cache of `Promise<Buffer>` objects, keyed by `"${ip}:${trackIndex}"`. TTL matches the flight data cache (5 minutes). Stores promises (not resolved buffers) so concurrent requests for the same track await the same in-flight ElevenLabs call.

```js
class AudioStore {
  constructor(ttlMs)
  getPromise(ip, trackIndex)           // → Promise<Buffer> | null
  setPromise(ip, trackIndex, promise)  // stores promise before EL call resolves
  clear(ip)                            // evict all tracks for an IP
  sweep()                              // called on interval, same as Cache
}

// Exported singleton (same pattern as cache.js):
const audioStore = new AudioStore(CACHE_TTL_MS);
```

**Abstraction note:** All storage is inside `AudioStore`. To move to disk or R2, only this class changes.

### `src/routes/stream.js`

Express router mounted at `/stream`. Handles all 21 track patterns:

```
GET /stream/intro.mp3        → sendFile public/audio/intro.mp3
GET /stream/squelch-:n.mp3   → n > aircraft count ? silence : sendFile squelch.mp3
GET /stream/aircraft-:n.mp3  → n > aircraft count ? silence : await audioStore / generate
GET /stream/silence.mp3      → sendFile public/audio/silence.mp3
```

Generation trigger (runs once per IP per TTL window):
1. Call `buildAircraftData(ip)` — hits existing cache or fetches fresh
2. For each aircraft (index 1..count): fire `synthesize(aircraft.script)`, store promise in `audioStore`
3. All fires are concurrent (`Promise.all` submission, individual `await` per track request)

Timeout: each track request awaits its promise with a 15-second cap. If the cap is hit, `silence.mp3` is served and a warning is logged. The promise continues resolving in the background so subsequent requests for that track (next play-through) will succeed.

### `public/audio/` — Static Assets

Three files committed to the repo:

| File | Description |
|------|-------------|
| `intro.mp3` | ~5–10s generic narration: *"Welcome to Planes Nearby. Scanning the skies above you now — here's what's up there."* Generated once via ElevenLabs during development and committed as a binary asset. |
| `squelch.mp3` | ~1–2s radio squelch / static sound effect. Sourced from a royalty-free audio library and committed. One file; all 10 squelch track requests map to it. |
| `silence.mp3` | Exactly 1 second of silence. Generated once (trivial) and committed. |

---

## Modified Files

### `src/server.js`

Mount the stream router:
```js
const streamRouter = require('./routes/stream');
app.use('/stream', streamRouter);
```

### `.env.example`

```
# ElevenLabs TTS (https://elevenlabs.io — create a free/starter account, copy API key from Profile)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_IDS=cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_SPEED=1.0
ELEVENLABS_STABILITY=0.45
ELEVENLABS_SIMILARITY=0.80
```

### `CLAUDE.md`

Add `ELEVENLABS_API_KEY` to the environment variables table. Add `/stream/*` route docs and `audioStore` to the Architecture section.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| ElevenLabs API error on one track | That track's promise rejects → serve silence; other tracks unaffected |
| ElevenLabs API key missing | `synthesize()` throws on import → server logs clear error on startup |
| All tracks time out (API down) | All aircraft tracks return silence; static tracks (intro, squelch) always available |
| IP geolocation fails | Same as existing `/api/aircraft` behaviour — 500 on that track request |
| No aircraft returned | All aircraft-N and squelch-N tracks return silence; intro still plays |

---

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `ELEVENLABS_API_KEY` | Yes | — | From elevenlabs.io Profile → API Keys |
| `ELEVENLABS_VOICE_IDS` | No | `cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ` | Comma-separated list. One voice chosen at random per track — creates the effect of different "operators" on each aircraft report. Single entry = always that voice. Defaults include Marty (AU male) and Johnny Texas (TX male). |
| `ELEVENLABS_MODEL_ID` | No | `eleven_flash_v2_5` | Flash 2.5 = fastest/cheapest. Alternatives: `eleven_v3`, `eleven_multilingual_v2` |
| `ELEVENLABS_SPEED` | No | `1.0` | 0.7–1.2 range |
| `ELEVENLABS_STABILITY` | No | `0.45` | 0–1; lower = more expressive |
| `ELEVENLABS_SIMILARITY` | No | `0.80` | 0–1; voice similarity boost |

---

## ElevenLabs Account Setup (for new deployments)

1. Create an account at https://elevenlabs.io (free tier includes ~10,000 chars/month)
2. Navigate to **Profile → API Keys** → **Create API Key**
3. Copy the key into `ELEVENLABS_API_KEY` in Railway (or `.env` locally)
4. To change the voice: browse **Voice Library**, click any voice → **Use** → copy the Voice ID shown in the URL or voice settings panel

---

## Testing

| Test | Approach |
|------|----------|
| `tts.js` unit | Mock `fetch`; verify request shape (voice ID, model, stability, similarity, speed) and that a Buffer is returned |
| `audioStore.js` unit | Verify promise storage, TTL eviction, concurrent-request dedup (two `getPromise` calls before `setPromise` resolves both return the same promise) |
| `stream.js` route | Supertest; mock `buildAircraftData` and `synthesize`; verify static files served for intro/squelch/silence, silence returned for N > aircraft count, correct track awaited for aircraft-N |

---

## What This Is Not

- Not a real-time stream — each track is a discrete MP3 file request
- Not a server-sent playlist generator — the Yoto playlist is submitted once and never changes; only the MP3 content at each URL is dynamic
- Not multi-tenant isolated — two households on the same ISP NAT IP share a cache entry (acceptable trade-off, same as the web app)
