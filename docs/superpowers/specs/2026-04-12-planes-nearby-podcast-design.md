# PlanesNearbyPodcast — Design Spec
**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

A lightweight Node.js web application that detects the visitor's physical location from their IP address, finds aircraft within 10 nautical miles using FlightAware's AeroAPI, and displays the nearest/most interesting planes alongside kid-friendly descriptive scripts. Results are cached per IP per 5-minute window to minimize API calls.

The architecture is designed with a future TTS/podcast expansion in mind: a `/api/aircraft` endpoint exposes structured JSON (including pre-generated scripts) so a future audio pipeline can call the same data without any backend changes.

---

## Architecture

### Request Lifecycle

```
Browser (first load)
  → GET /
  → Express checks in-memory cache (key = client IP, TTL = 5 min)
      ├─ Cache HIT  → render SSR HTML with cached data, return
      └─ Cache MISS → IPGeolocation.io API (IP → lat/lon/city/state)
                    → FlightAware AeroAPI (lat/lon, 10 nm radius)
                    → Filter & sort aircraft
                    → Generate kid-friendly scripts
                    → Store result in cache
                    → Render SSR HTML with embedded JSON, return

Browser (refresh button, after 5-min cache window)
  → GET /api/aircraft
  → Same cache/fetch logic, returns JSON
  → Client updates cards + map in-place (no full page reload)

Future TTS pipeline
  → GET /api/aircraft  (same endpoint, no changes needed)
  → Pass script text to ElevenLabs / Google TTS
  → Return MP3 to Yoto device
```

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `src/server.js` | Express routes, proxy trust (`trust proxy 1`), IP detection, `?ip=` override for dev/testing |
| `src/cache.js` | In-memory TTL cache keyed by IP; auto-expires entries after 5 minutes |
| `src/services/geolocation.js` | Calls IPGeolocation.io → returns `{lat, lon, city, state}` |
| `src/services/flightaware.js` | Calls FlightAware AeroAPI → returns raw flight array within 10 nm |
| `src/services/aircraft.js` | Tags interesting aircraft, calculates distances (Haversine), sorts, de-dupes, returns final list |
| `src/services/scriptGenerator.js` | Converts a single aircraft object into a kid-friendly script string |
| `src/views/page.js` | Accepts data object → returns full SSR HTML string with embedded JSON for client hydration |

### File Structure

```
PlanesNearbyPodcast/
├── src/
│   ├── server.js
│   ├── cache.js
│   └── services/
│       ├── geolocation.js
│       ├── flightaware.js
│       ├── aircraft.js
│       └── scriptGenerator.js
├── src/views/
│   └── page.js
├── public/
│   └── fa-logo.png             # FlightAware favicon for attribution links
├── .github/
│   └── workflows/
│       └── preview-comment.yml # Posts Railway preview URL as PR comment
├── package.json
├── .env.example
├── .gitignore
├── railway.toml
└── README.md
```

---

## API

### Endpoints

| Route | Returns | Notes |
|---|---|---|
| `GET /` | SSR HTML page | Full themed page; theme determined server-side |
| `GET /api/aircraft` | JSON | Structured aircraft data + scripts; used by refresh button and future TTS |
| `GET /health` | `{"status":"ok"}` | Railway health check |

**Query param override:** `?ip=1.2.3.4` accepted on both `GET /` and `GET /api/aircraft` for local development and testing (since `127.0.0.1` cannot be geolocated).

### `/api/aircraft` Response Shape

```json
{
  "location": {
    "city": "Dallas",
    "state": "Texas",
    "lat": 32.78,
    "lon": -96.80
  },
  "theme": "day",
  "cachedAt": 1713900000000,
  "expiresAt": 1713900300000,
  "aircraft": [
    {
      "ident": "DAL247",
      "registration": "N123DA",
      "aircraftType": "B737",
      "friendlyType": "Boeing 737",
      "flightawareUrl": "https://www.flightaware.com/live/flight/DAL247",  // permalink from AeroAPI response; constructed from ident as fallback
      "origin": { "code": "KATL", "name": "Hartsfield–Jackson Atlanta" },
      "destination": { "code": "KDFW", "name": "Dallas/Fort Worth International" },
      "departureTime": "2024-04-23T14:30:00Z",
      "arrivalTime": "2024-04-23T16:15:00Z",
      "altitude": 28000,
      "groundspeed": 430,
      "position": { "lat": 32.91, "lon": -96.65 },
      "distanceNm": 1.2,
      "squawk": "1234",
      "interesting": false,
      "interestingReason": null,
      "script": "About 1.2 nautical miles away from you, there is a Boeing 737 with the callsign Delta 247. This airplane departed from Hartsfield–Jackson Atlanta at 2:30 in the afternoon and is heading to Dallas/Fort Worth International, where it's expected to land at 4:15. Right now it's flying at 28,000 feet — that's way up in the clouds!"
    }
  ]
}
```

---

## Aircraft Selection Logic

1. Fetch all flights within 10 nm from FlightAware AeroAPI
2. Filter to airborne aircraft only (position present, altitude > 0)
3. Calculate straight-line distance from user's lat/lon to each aircraft's last reported position using the Haversine formula
4. Tag aircraft as `interesting` if any of the following apply:
   - **Emergency squawk:** 7500 (hijacking), 7600 (radio failure), 7700 (general emergency)
   - **Military callsign patterns:** `RCH`/`REACH` (Air Mobility Command), `ARMY`, `NAVY`, `USMC`, `USCG`, `SAM` (Special Air Mission / VIP), `PAT`, `VENUS`, `JAKE`, `SPAR`
   - **Medical callsigns:** `MEDEVAC`, `LIFEGUARD`, `AIR MED`
   - **Notable types:** A225 (Antonov An-225), B52 (B-52), CONC (Concorde — historic), airship/blimp ICAO types
5. Sort non-interesting aircraft by `distanceNm` ascending, take top 5
6. Merge: interesting aircraft + top 5, de-duped (an aircraft already in the top 5 that is also interesting keeps its interesting badge; it is not listed twice)
7. Final sort: interesting aircraft first (sorted among themselves by distance), then top 5 by distance

### "No planes found" State

If the AeroAPI returns zero airborne flights within 10 nm, the page renders a friendly empty state: a message like "The skies above you are quiet right now — check back soon!" with the map still centered on the user's location.

---

## Kid-Friendly Script Generation

Scripts are generated per-aircraft by `scriptGenerator.js`. Template logic (not string templates — conditional logic in JS) produces natural-sounding sentences:

- **Distance:** "About 3.2 nautical miles away" / "Less than a mile away"
- **Aircraft type:** Uses a human-readable mapping (e.g., `B737` → "Boeing 737"). Falls back to `"airplane"` if unknown.
- **Callsign:** Read digit-by-digit for airline flights (e.g., "Delta 2-4-7") or as-is for tail numbers
- **Origin/destination:** Full airport name when available, ICAO code as fallback
- **Departure/arrival times:** Formatted in local-friendly 12-hour time (e.g., "2:30 in the afternoon")
- **Altitude:** Converted to feet with a kid-friendly comparison when possible (e.g., "28,000 feet — that's way up in the clouds!")
- **Interesting reason:** Prepended naturally (e.g., "This is a military airplane called..." / "This airplane is broadcasting an emergency signal!")

Scripts are plain strings stored in the JSON response, making them directly passable to a TTS API in the future.

---

## Frontend

### Themes

| CSS class on `<body>` | When applied | Visual style |
|---|---|---|
| `theme-day` | `theme: "day"` from server (sunrise to sunset at user's lat/lon, calculated via `suncalc` npm package) | Sky blue gradient, white clouds, warm colours |
| `theme-night` | `theme: "night"` from server | Deep navy, glowing cards, subtle star pattern |
| `theme-basic` | User toggles via button; stored in `localStorage`; applied by inline JS before first paint to avoid flash | Clean white/grey, blue accent |

The toggle button sits top-right: **"Switch to Basic View"** / **"Switch to Themed View"**. Toggling updates `localStorage` and swaps the body class — no reload needed.

### Page Layout

**Desktop (≥ 768 px) — side by side:**
```
┌─────────────────────────────────────────────────────────┐
│  ✈️ Planes Near You — Dallas, TX      [Basic View ⇄]   │
│  Updated just now        [Reload — available in 4:32]   │
├────────────────────────┬────────────────────────────────┤
│  Aircraft Cards        │                                │
│  ┌──────────────────┐  │     Leaflet / OpenStreetMap    │
│  │ 🚨 N7700X [FA🔗] │  │                                │
│  │  [EMERGENCY]     │  │   📍 = you                     │
│  └──────────────────┘  │   ✈️ = aircraft (clickable)    │
│  ┌──────────────────┐  │                                │
│  │ ✈️ DAL247 [FA🔗] │  │   Clicking a card pans the     │
│  │  [#1 Closest] ▼  │  │   map to that aircraft and     │
│  │  Boeing 737      │  │   pulses its marker            │
│  │  1.2 nm · 28kft  │  │                                │
│  │  ATL → DFW       │  │                                │
│  │  "About 1.2 nm…" │  │                                │
│  └──────────────────┘  │                                │
│  ┌──────────────────┐  │                                │
│  │ ✈️ UAL88  [FA🔗] │  │                                │
│  │  [#2 Closest] ▶  │  │                                │
│  └──────────────────┘  │                                │
└────────────────────────┴────────────────────────────────┘
```

**Mobile (< 768 px):** map stacks full-width above cards. Both sections full-width and scrollable.

### Aircraft Card Anatomy (expanded)

```
┌────────────────────────────────────────────┐
│ ✈️  DAL247 [FA🔗]              [#1 Closest] │  ← FA logo = small FlightAware favicon,
│ Boeing 737 · 1.2 nm · 28,000 ft           │    links to flight page in new tab
│ Atlanta → Dallas/Fort Worth                │
│ Departed 2:30 PM · Arrives 4:15 PM        │
│ ─────────────────────────────────────────  │
│ "About 1.2 nautical miles away from you,   │
│  there is a Boeing 737…"                   │
└────────────────────────────────────────────┘
```

**Interesting aircraft badge variants:**

| Reason | Badge style |
|---|---|
| Emergency squawk | Red border + `[🚨 EMERGENCY]` badge |
| Military | Blue border + `[🇺🇸 MILITARY]` badge |
| Medical | Green border + `[🏥 MEDICAL]` badge |
| Top 5 | Subtle grey border + `[#N Closest]` badge |

### Interactions

| Action | Behaviour |
|---|---|
| Page load | First card auto-expanded; all others collapsed |
| Click card header | Toggle expand/collapse |
| Click expanded card | Pans + zooms Leaflet map to that aircraft; pulses marker |
| Click FlightAware logo | Opens flight page in new tab |
| Reload button (disabled) | Shows countdown: `Reload — available in 4:32` |
| Reload button (enabled) | Calls `GET /api/aircraft`; smoothly replaces card list and re-centers map; resets countdown |
| Theme toggle | Swaps body class; saves to `localStorage`; instant, no reload |
| Map marker click | Expands + scrolls to that aircraft's card |

---

## Caching

- **Store:** In-memory `Map` in the Node.js process (`src/cache.js`)
- **Key:** Client IP address (from `req.ip` with `trust proxy 1` set)
- **TTL:** 5 minutes (300,000 ms)
- **On miss:** Full API fetch → store result with `{data, cachedAt}` timestamp
- **On hit:** Return cached data; compute `expiresAt` from `cachedAt + TTL` for the client countdown
- **Eviction:** Lazy (checked on read) + periodic sweep every 10 minutes to prevent unbounded growth
- **Limitation:** Cache is per-process. Railway restarts clear it. This is acceptable — worst case is one extra API call per IP after a restart.

---

## Environment Variables

| Variable | Required | Source |
|---|---|---|
| `IPGEO_API_KEY` | Yes | IPGeolocation.io dashboard |
| `FLIGHTAWARE_API_KEY` | Yes | FlightAware AeroAPI dashboard |
| `PORT` | No | Injected by Railway automatically |
| `NODE_ENV` | No | Set to `production` by Railway automatically |

Never committed to the repo. `.env.example` is committed as a template.

---

## Deployment

### Railway

- **Build:** Nixpacks auto-detects Node.js; runs `npm install`
- **Start:** `node src/server.js` (defined in `railway.toml` and `package.json` `start` script)
- **Health check:** `GET /health` → `{"status":"ok"}`
- **Preview deployments:** Enabled in Railway project settings; each PR gets its own preview URL

### `railway.toml`

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### GitHub Actions — PR Preview Comment

File: `.github/workflows/preview-comment.yml`

Triggers on `pull_request` (opened, synchronize, reopened). Waits for Railway to finish building the preview deployment, then posts (or updates) a single comment on the PR:

```
🚂 Railway Preview Deployment
Preview URL: https://planesnearby-git-my-branch-xyz.up.railway.app
Updated: 2026-04-12 14:32 UTC
```

**Required GitHub repo secrets:**

| Secret | Where to find it |
|---|---|
| `RAILWAY_TOKEN` | Railway dashboard → Account Settings → Tokens |
| `RAILWAY_PROJECT_ID` | Railway dashboard → Project Settings |

### Local Development

```bash
cp .env.example .env        # fill in your API keys
npm install
npm run dev                 # nodemon watches src/ for changes
# Visit http://localhost:3000?ip=8.8.8.8 to test with a real IP
```

---

## README Coverage

The README will include step-by-step instructions for:

1. Prerequisites (Node.js 20+, npm, Railway account, GitHub account)
2. Getting API keys — IPGeolocation.io free tier sign-up, FlightAware AeroAPI sign-up
3. Forking/cloning the repo and local setup
4. Connecting the GitHub repo to Railway (step-by-step with screenshots described)
5. Enabling PR preview deployments in Railway project settings
6. Setting environment variables in Railway dashboard (`IPGEO_API_KEY`, `FLIGHTAWARE_API_KEY`)
7. Setting GitHub repo secrets for the preview comment workflow (`RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`)
8. Verifying the deployment is live

---

## Future TTS / Yoto Expansion

No work is required now. When the time comes:

- Call `GET /api/aircraft` to get the current aircraft list with pre-generated scripts
- Pass each `aircraft.script` string to ElevenLabs or Google TTS
- Stitch the returned audio clips into a single MP3
- Serve the MP3 or stream it to the Yoto device

The only addition needed is a new route (e.g., `GET /api/podcast.mp3`) that orchestrates the above. The data layer and script generation are already in place.
