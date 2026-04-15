# PlanesNearbyPodcast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js/Express web app that geolocates visitors, finds aircraft within 10 nm using FlightAware AeroAPI, and renders a themed single-page display with kid-friendly scripts — cached per IP per 5 minutes, with a `/api/aircraft` JSON endpoint ready for future TTS use.

**Architecture:** Server-side rendered HTML page (GET /) embeds aircraft data as JSON for client hydration. A parallel GET /api/aircraft endpoint returns raw JSON used by the refresh button and future TTS pipeline. In-memory TTL cache keyed by IP avoids redundant API calls. Client-side DOM updates use `createElement`/`textContent` throughout — no dynamic HTML string insertion.

**Tech Stack:** Node.js 20+, Express 4, suncalc, dotenv · Jest + supertest for tests · Leaflet + OpenStreetMap (CDN) for maps · Railway (deployment) · GitHub Actions (PR preview comments)

---

## File Map

| File | Responsibility |
|---|---|
| `src/server.js` | Express app, `trust proxy`, routes (GET /, GET /api/aircraft, GET /health) |
| `src/cache.js` | In-memory TTL Map; `get(key)`, `set(key, data)`, `getMetadata(key)`, `sweep()`, `clear()` |
| `src/services/geolocation.js` | `getGeolocation(ip, now?)` → `{lat, lon, city, state, theme}` |
| `src/services/flightaware.js` | `getNearbyFlights(lat, lon)` → raw FlightAware flight array |
| `src/services/aircraft.js` | `processFlights(flights, lat, lon)` → sorted, tagged, deduped array |
| `src/services/scriptGenerator.js` | `generateScript(aircraft)` → kid-friendly string |
| `src/views/page.js` | `renderPage(data)` → full SSR HTML string; `renderCard(aircraft, index)` → card HTML string |
| `tests/cache.test.js` | Unit tests for cache |
| `tests/geolocation.test.js` | Unit tests for geolocation service (fetch mocked) |
| `tests/flightaware.test.js` | Unit tests for FlightAware service (fetch mocked) |
| `tests/aircraft.test.js` | Unit tests for aircraft filtering/sorting |
| `tests/scriptGenerator.test.js` | Unit tests for script generation |
| `tests/routes.test.js` | Integration tests for Express routes (supertest) |
| `public/fa-logo.png` | FlightAware 16x16 favicon for attribution links |
| `.github/workflows/preview-comment.yml` | Posts Railway preview URL as PR comment |
| `railway.toml` | Railway build + deploy config |
| `.env.example` | Env var template (committed, no secrets) |
| `README.md` | Complete setup and deployment guide |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `railway.toml`
- Create: `src/server.js` (skeleton)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "planes-nearby-podcast",
  "version": "1.0.0",
  "description": "Aircraft near your location with kid-friendly descriptions",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --forceExit",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "suncalc": "^1.9.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.env
.superpowers/
```

- [ ] **Step 3: Create `.env.example`**

```
IPGEO_API_KEY=your_ipgeolocation_io_api_key_here
FLIGHTAWARE_API_KEY=your_flightaware_aeroapi_key_here
```

- [ ] **Step 4: Create `railway.toml`**

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

- [ ] **Step 5: Create `src/server.js` skeleton**

```js
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes added in Task 8
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
```

- [ ] **Step 6: Install dependencies**

```bash
mkdir -p tests public
npm install
```

- [ ] **Step 7: Verify Jest is wired up**

```bash
npm test -- --testPathPattern=nonexistent 2>&1 | head -5
# Expected: "No tests found"
node -e "const app = require('./src/server'); console.log('Server loads OK')"
# Expected: Server loads OK
```

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example railway.toml src/server.js
git commit -m "feat: project scaffold — Express app, Jest, Railway config"
```

---

## Task 2: Cache Module

**Files:**
- Create: `src/cache.js`
- Create: `tests/cache.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/cache.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=cache
# Expected: FAIL — "Cannot find module '../src/cache'"
```

- [ ] **Step 3: Implement `src/cache.js`**

```js
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=cache
# Expected: PASS — 8 tests pass
```

- [ ] **Step 5: Commit**

```bash
git add src/cache.js tests/cache.test.js
git commit -m "feat: in-memory TTL cache with periodic sweep"
```

---

## Task 3: Geolocation Service

**Files:**
- Create: `src/services/geolocation.js`
- Create: `tests/geolocation.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/geolocation.test.js`:

```js
const { getGeolocation } = require('../src/services/geolocation');

jest.mock('suncalc', () => ({ getTimes: jest.fn() }));
const SunCalc = require('suncalc');

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

const MOCK_RESPONSE = {
  ip: '8.8.8.8',
  latitude: '32.7767',
  longitude: '-96.7970',
  city: 'Dallas',
  state_prov: 'Texas',
};

test('returns location and theme:day when sun is up', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE });
  SunCalc.getTimes.mockReturnValue({
    sunrise: new Date('2024-04-23T11:00:00Z'),
    sunset:  new Date('2024-04-23T23:30:00Z'),
  });
  const result = await getGeolocation('8.8.8.8', new Date('2024-04-23T14:00:00Z'));
  expect(result).toEqual({ lat: 32.7767, lon: -96.797, city: 'Dallas', state: 'Texas', theme: 'day' });
});

test('returns theme:night when sun is down', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE });
  SunCalc.getTimes.mockReturnValue({
    sunrise: new Date('2024-04-23T11:00:00Z'),
    sunset:  new Date('2024-04-23T23:30:00Z'),
  });
  const result = await getGeolocation('8.8.8.8', new Date('2024-04-23T03:00:00Z'));
  expect(result.theme).toBe('night');
});

test('throws on non-ok response', async () => {
  global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });
  await expect(getGeolocation('8.8.8.8')).rejects.toThrow('IPGeolocation API error: 401');
});

test('throws on missing lat/lon', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ip: '127.0.0.1' }) });
  await expect(getGeolocation('127.0.0.1')).rejects.toThrow('Could not determine location');
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=geolocation
# Expected: FAIL — "Cannot find module '../src/services/geolocation'"
```

- [ ] **Step 3: Create `src/services/geolocation.js`**

```js
const SunCalc = require('suncalc');

/**
 * @param {string} ip
 * @param {Date} [now]
 * @returns {Promise<{lat: number, lon: number, city: string, state: string, theme: 'day'|'night'}>}
 */
async function getGeolocation(ip, now = new Date()) {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEO_API_KEY}&ip=${ip}&fields=geo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPGeolocation API error: ${res.status}`);

  const data = await res.json();
  const lat = parseFloat(data.latitude);
  const lon = parseFloat(data.longitude);
  if (!lat || !lon) throw new Error('Could not determine location for this IP address');

  const times = SunCalc.getTimes(now, lat, lon);
  const theme = now >= times.sunrise && now < times.sunset ? 'day' : 'night';

  return { lat, lon, city: data.city || 'Unknown City', state: data.state_prov || '', theme };
}

module.exports = { getGeolocation };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=geolocation
# Expected: PASS — 4 tests pass
```

- [ ] **Step 5: Commit**

```bash
git add src/services/geolocation.js tests/geolocation.test.js
git commit -m "feat: geolocation service with day/night theme via suncalc"
```

---

## Task 4: FlightAware Service

**Files:**
- Create: `src/services/flightaware.js`
- Create: `tests/flightaware.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/flightaware.test.js`:

```js
const { getNearbyFlights } = require('../src/services/flightaware');

beforeEach(() => { global.fetch = jest.fn(); });

const MOCK_FLIGHT = {
  ident: 'DAL247',
  registration: 'N123DA',
  aircraft_type: 'B738',
  origin: { code: 'KATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport' },
  destination: { code: 'KDFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport' },
  scheduled_off: '2024-04-23T14:30:00Z',
  actual_off: '2024-04-23T14:35:00Z',
  scheduled_on: '2024-04-23T16:15:00Z',
  estimated_on: '2024-04-23T16:10:00Z',
  status: 'En Route',
  last_position: { altitude: 280, groundspeed: 430, latitude: 32.91, longitude: -96.65 },
};

test('returns array of flights from AeroAPI', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ flights: [MOCK_FLIGHT], num_pages: 1 }),
  });
  const result = await getNearbyFlights(32.78, -96.80);
  expect(result).toHaveLength(1);
  expect(result[0].ident).toBe('DAL247');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('32.78'),
    expect.objectContaining({ headers: expect.objectContaining({ 'x-apikey': expect.any(String) }) })
  );
});

test('returns empty array when no flights found', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ flights: [], num_pages: 1 }) });
  expect(await getNearbyFlights(32.78, -96.80)).toEqual([]);
});

test('throws on non-ok response', async () => {
  global.fetch.mockResolvedValueOnce({ ok: false, status: 403 });
  await expect(getNearbyFlights(32.78, -96.80)).rejects.toThrow('FlightAware API error: 403');
});

test('includes radius of 10 in request URL', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ flights: [], num_pages: 1 }) });
  await getNearbyFlights(32.78, -96.80);
  expect(fetch.mock.calls[0][0]).toContain('10');
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=flightaware
# Expected: FAIL — "Cannot find module '../src/services/flightaware'"
```

- [ ] **Step 3: Create `src/services/flightaware.js`**

```js
const AEROAPI_BASE = 'https://aeroapi.flightaware.com/aeroapi';
const SEARCH_RADIUS_NM = 10;

/**
 * Search for flights within SEARCH_RADIUS_NM nautical miles of lat/lon.
 * Uses AeroAPI FLIFO query: -latlong "lat lon" -radius NM
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object[]>} Raw FlightAware flight objects
 */
async function getNearbyFlights(lat, lon) {
  const query = `-latlong "${lat} ${lon}" -radius ${SEARCH_RADIUS_NM}`;
  const url = `${AEROAPI_BASE}/flights/search?query=${encodeURIComponent(query)}&max_pages=1`;

  const res = await fetch(url, {
    headers: {
      'x-apikey': process.env.FLIGHTAWARE_API_KEY || '',
      'Accept': 'application/json; charset=UTF-8',
    },
  });

  if (!res.ok) throw new Error(`FlightAware API error: ${res.status}`);
  const data = await res.json();
  return data.flights ?? [];
}

module.exports = { getNearbyFlights };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=flightaware
# Expected: PASS — 4 tests pass
```

- [ ] **Step 5: Commit**

```bash
git add src/services/flightaware.js tests/flightaware.test.js
git commit -m "feat: FlightAware AeroAPI service — search flights by lat/lon"
```

---

## Task 5: Aircraft Filtering & Sorting

**Files:**
- Create: `src/services/aircraft.js`
- Create: `tests/aircraft.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/aircraft.test.js`:

```js
const { haversineNm, tagInteresting, processFlights } = require('../src/services/aircraft');

describe('haversineNm', () => {
  test('returns 0 for same point', () => {
    expect(haversineNm(32.78, -96.80, 32.78, -96.80)).toBe(0);
  });

  test('antipodal points are > 10000 nm apart', () => {
    expect(haversineNm(0, 0, 0, 180)).toBeGreaterThan(10000);
  });

  test('DFW to DAL is roughly 14-16 nm', () => {
    const d = haversineNm(32.8998, -97.0403, 32.8471, -96.8517);
    expect(d).toBeGreaterThan(12);
    expect(d).toBeLessThan(18);
  });
});

describe('tagInteresting', () => {
  const base = { ident: 'DAL247', last_position: { altitude: 280 } };

  test('normal flight is not interesting', () => {
    expect(tagInteresting(base)).toEqual({ interesting: false, interestingReason: null });
  });

  test('squawk 7700 = emergency_7700', () => {
    expect(tagInteresting({ ...base, squawk: '7700' })).toEqual({ interesting: true, interestingReason: 'emergency_7700' });
  });

  test('squawk 7500 = emergency_7500', () => {
    expect(tagInteresting({ ...base, squawk: '7500' }).interestingReason).toBe('emergency_7500');
  });

  test('squawk 7600 = emergency_7600', () => {
    expect(tagInteresting({ ...base, squawk: '7600' }).interestingReason).toBe('emergency_7600');
  });

  test('REACH205 = military', () => {
    expect(tagInteresting({ ...base, ident: 'REACH205' }).interestingReason).toBe('military');
  });

  test('SAM45000 = military', () => {
    expect(tagInteresting({ ...base, ident: 'SAM45000' }).interestingReason).toBe('military');
  });

  test('LIFEGUARD1 = medical', () => {
    expect(tagInteresting({ ...base, ident: 'LIFEGUARD1' }).interestingReason).toBe('medical');
  });

  test('MEDEVAC5 = medical', () => {
    expect(tagInteresting({ ...base, ident: 'MEDEVAC5' }).interestingReason).toBe('medical');
  });
});

describe('processFlights', () => {
  const uLat = 32.78, uLon = -96.80;

  function makeFlight(ident, lat, lon, extra = {}) {
    return {
      ident,
      registration: 'N' + ident,
      aircraft_type: 'B738',
      origin: { code: 'KATL', city: 'Atlanta', name: 'Atlanta' },
      destination: { code: 'KDFW', city: 'Dallas', name: 'Dallas' },
      scheduled_off: '2024-04-23T14:30:00Z',
      estimated_on: '2024-04-23T16:15:00Z',
      status: 'En Route',
      last_position: { latitude: lat, longitude: lon, altitude: 280, groundspeed: 430 },
      ...extra,
    };
  }

  test('empty input returns empty output', () => {
    expect(processFlights([], uLat, uLon)).toEqual([]);
  });

  test('filters out flights without last_position', () => {
    const f = makeFlight('F1', 32.79, -96.81);
    delete f.last_position;
    expect(processFlights([f], uLat, uLon)).toEqual([]);
  });

  test('filters out grounded flights (altitude 0)', () => {
    const f = makeFlight('F1', 32.79, -96.81);
    f.last_position.altitude = 0;
    expect(processFlights([f], uLat, uLon)).toEqual([]);
  });

  test('sorts by distance ascending', () => {
    const flights = [
      makeFlight('FAR', 32.86, -96.87),
      makeFlight('NEAR', 32.785, -96.805),
      makeFlight('MID', 32.83, -96.84),
    ];
    const result = processFlights(flights, uLat, uLon);
    expect(result[0].ident).toBe('NEAR');
    expect(result[1].ident).toBe('MID');
    expect(result[2].ident).toBe('FAR');
  });

  test('caps non-interesting at 5', () => {
    const flights = Array.from({ length: 8 }, (_, i) =>
      makeFlight('F' + i, 32.78 + i * 0.01, -96.80)
    );
    const result = processFlights(flights, uLat, uLon);
    expect(result.filter(f => !f.interesting).length).toBeLessThanOrEqual(5);
  });

  test('interesting aircraft appear before top-5', () => {
    const normal = makeFlight('NORMAL', 32.785, -96.805);
    const emerg = makeFlight('EMERG', 32.86, -96.87, { squawk: '7700' });
    const result = processFlights([normal, emerg], uLat, uLon);
    expect(result[0].ident).toBe('EMERG');
    expect(result[0].interesting).toBe(true);
  });

  test('interesting aircraft in top-5 are not duplicated', () => {
    const emerg = makeFlight('EMERG', 32.785, -96.805, { squawk: '7700' });
    const result = processFlights([emerg], uLat, uLon);
    expect(result.filter(f => f.ident === 'EMERG')).toHaveLength(1);
    expect(result[0].interesting).toBe(true);
  });

  test('each flight gets distanceNm, friendlyType, flightawareUrl', () => {
    const result = processFlights([makeFlight('DAL247', 32.79, -96.81)], uLat, uLon);
    expect(result[0].distanceNm).toBeGreaterThan(0);
    expect(result[0].friendlyType).toBeDefined();
    expect(result[0].flightawareUrl).toBe('https://www.flightaware.com/live/flight/DAL247');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=aircraft
# Expected: FAIL — "Cannot find module '../src/services/aircraft'"
```

- [ ] **Step 3: Create `src/services/aircraft.js`**

```js
const AIRCRAFT_NAMES = {
  A319:'Airbus A319', A320:'Airbus A320', A321:'Airbus A321',
  A332:'Airbus A330', A333:'Airbus A330', A343:'Airbus A340',
  A359:'Airbus A350', A380:'Airbus A380 Super Jumbo',
  B712:'Boeing 717', B737:'Boeing 737', B738:'Boeing 737-800',
  B739:'Boeing 737-900', B744:'Boeing 747 Jumbo Jet', B748:'Boeing 747-8',
  B752:'Boeing 757', B762:'Boeing 767', B763:'Boeing 767',
  B772:'Boeing 777', B773:'Boeing 777', B77W:'Boeing 777-300',
  B788:'Boeing 787 Dreamliner', B789:'Boeing 787 Dreamliner',
  B78X:'Boeing 787-10 Dreamliner',
  MD11:'McDonnell Douglas MD-11', MD88:'McDonnell Douglas MD-80',
  CRJ2:'Bombardier CRJ-200', CRJ7:'Bombardier CRJ-700', CRJ9:'Bombardier CRJ-900',
  E145:'Embraer ERJ-145', E170:'Embraer E170', E175:'Embraer E175',
  E190:'Embraer E190', E195:'Embraer E195',
  C172:'Cessna Skyhawk', C182:'Cessna Skylane', C208:'Cessna Caravan',
  PA28:'Piper Cherokee', BE36:'Beechcraft Bonanza', BE9L:'Beechcraft King Air',
  PC12:'Pilatus PC-12',
  C25B:'Cessna Citation CJ3', C550:'Cessna Citation II', C680:'Cessna Citation Sovereign',
  GLF4:'Gulfstream G-IV', GLF5:'Gulfstream G-V', GLF6:'Gulfstream G650',
  GLEX:'Bombardier Global Express', GL7T:'Bombardier Global 7500',
  LJ35:'Learjet 35', LJ45:'Learjet 45', F900:'Dassault Falcon 900',
  HDJT:'HondaJet',
  B06:'Bell 206 Helicopter', B407:'Bell 407 Helicopter',
  EC35:'Airbus H135 Helicopter', EC45:'Airbus H145 Helicopter',
  AS50:'Airbus AS350 Helicopter', S76:'Sikorsky S-76 Helicopter',
  S92:'Sikorsky S-92 Helicopter', R44:'Robinson R44 Helicopter',
  C17:'Boeing C-17 Globemaster', C130:'Lockheed C-130 Hercules',
  C5:'Lockheed C-5 Galaxy', B52:'Boeing B-52 Stratofortress',
  KC135:'Boeing KC-135 Stratotanker',
  A225:'Antonov An-225 — the World\'s Largest Airplane',
};

const EMERGENCY_SQUAWKS = {
  '7500': 'emergency_7500',
  '7600': 'emergency_7600',
  '7700': 'emergency_7700',
};

const MILITARY_PREFIXES = ['REACH','RCH','ARMY','NAVY','USMC','USCG','SAM','PAT','VENUS','JAKE','SPAR','EVAC','MAGMA'];
const MEDICAL_PREFIXES  = ['MEDEVAC','LIFEGUARD','AIRMED','MEDIVAC'];

/**
 * Haversine distance in nautical miles between two lat/lon points.
 */
function haversineNm(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns {interesting, interestingReason} for a raw AeroAPI flight.
 */
function tagInteresting(flight) {
  const ident = (flight.ident || '').toUpperCase();
  if (flight.squawk && EMERGENCY_SQUAWKS[flight.squawk]) {
    return { interesting: true, interestingReason: EMERGENCY_SQUAWKS[flight.squawk] };
  }
  if (MILITARY_PREFIXES.some(p => ident.startsWith(p))) {
    return { interesting: true, interestingReason: 'military' };
  }
  if (MEDICAL_PREFIXES.some(p => ident.startsWith(p))) {
    return { interesting: true, interestingReason: 'medical' };
  }
  return { interesting: false, interestingReason: null };
}

/**
 * Filter, enrich, and sort raw AeroAPI flights.
 * Returns: interesting aircraft (by distance) then top-5 closest, de-duped.
 *
 * @param {object[]} flights - raw AeroAPI flight objects
 * @param {number} userLat
 * @param {number} userLon
 * @returns {object[]}
 */
function processFlights(flights, userLat, userLon) {
  const airborne = flights.filter(f =>
    f.last_position &&
    typeof f.last_position.latitude === 'number' &&
    typeof f.last_position.longitude === 'number' &&
    f.last_position.altitude > 0
  );

  const enriched = airborne.map(f => {
    const dist = haversineNm(userLat, userLon, f.last_position.latitude, f.last_position.longitude);
    return {
      ...f,
      distanceNm: Math.round(dist * 10) / 10,
      friendlyType: AIRCRAFT_NAMES[f.aircraft_type] || f.aircraft_type || 'airplane',
      flightawareUrl: `https://www.flightaware.com/live/flight/${f.ident}`,
      ...tagInteresting(f),
    };
  });

  const interesting = enriched
    .filter(f => f.interesting)
    .sort((a, b) => a.distanceNm - b.distanceNm);

  const interestingIdents = new Set(interesting.map(f => f.ident));

  const top5 = enriched
    .filter(f => !f.interesting && !interestingIdents.has(f.ident))
    .sort((a, b) => a.distanceNm - b.distanceNm)
    .slice(0, 5);

  return [...interesting, ...top5];
}

module.exports = { haversineNm, tagInteresting, processFlights };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=aircraft
# Expected: PASS — all tests pass
```

- [ ] **Step 5: Commit**

```bash
git add src/services/aircraft.js tests/aircraft.test.js
git commit -m "feat: aircraft filtering, Haversine distance, interesting tagging"
```

---

## Task 6: Script Generator

**Files:**
- Create: `src/services/scriptGenerator.js`
- Create: `tests/scriptGenerator.test.js`

- [ ] **Step 1: Write failing tests**

Create `tests/scriptGenerator.test.js`:

```js
const { generateScript } = require('../src/services/scriptGenerator');

function makeAircraft(overrides = {}) {
  return {
    ident: 'DAL247',
    registration: 'N123DA',
    friendlyType: 'Boeing 737',
    aircraft_type: 'B738',
    origin: { code: 'KATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport' },
    destination: { code: 'KDFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport' },
    actual_off: '2024-04-23T14:35:00Z',
    estimated_on: '2024-04-23T16:10:00Z',
    last_position: { altitude: 280, groundspeed: 430 },
    distanceNm: 3.2,
    interesting: false,
    interestingReason: null,
    ...overrides,
  };
}

test('includes distance', () => {
  expect(generateScript(makeAircraft({ distanceNm: 3.2 }))).toContain('3.2');
});

test('includes aircraft type', () => {
  expect(generateScript(makeAircraft())).toContain('Boeing 737');
});

test('includes origin and destination cities', () => {
  const s = generateScript(makeAircraft());
  expect(s).toContain('Atlanta');
  expect(s).toContain('Dallas');
});

test('includes altitude in feet', () => {
  expect(generateScript(makeAircraft())).toContain('28,000');
});

test('emergency prefix for emergency_7700', () => {
  const s = generateScript(makeAircraft({ interesting: true, interestingReason: 'emergency_7700' }));
  expect(s.toLowerCase()).toContain('emergency');
});

test('military prefix for military', () => {
  const s = generateScript(makeAircraft({ interesting: true, interestingReason: 'military' }));
  expect(s.toLowerCase()).toContain('military');
});

test('medical prefix for medical', () => {
  const s = generateScript(makeAircraft({ interesting: true, interestingReason: 'medical' }));
  expect(s.toLowerCase()).toContain('medical');
});

test('handles missing origin/destination gracefully', () => {
  const aircraft = makeAircraft({ origin: null, destination: null });
  expect(() => generateScript(aircraft)).not.toThrow();
  expect(generateScript(aircraft)).toContain('Boeing 737');
});

test('sub-1nm described as less than one', () => {
  expect(generateScript(makeAircraft({ distanceNm: 0.4 }))).toMatch(/less than/i);
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=scriptGenerator
# Expected: FAIL — "Cannot find module '../src/services/scriptGenerator'"
```

- [ ] **Step 3: Create `src/services/scriptGenerator.js`**

```js
const EMERGENCY_PHRASES = {
  emergency_7700: 'This airplane is broadcasting a general emergency signal!',
  emergency_7500: 'This airplane has reported a hijacking emergency!',
  emergency_7600: 'This airplane has lost radio contact with air traffic control!',
};

function formatAltitude(altHundreds) {
  if (!altHundreds) return null;
  const feet = altHundreds * 100;
  const formatted = feet.toLocaleString('en-US');
  if (feet >= 35000) return `${formatted} feet — that's above most clouds!`;
  if (feet >= 18000) return `${formatted} feet — way up in the sky!`;
  if (feet >= 5000)  return `${formatted} feet — high above the rooftops!`;
  return `${formatted} feet — still climbing or getting ready to land!`;
}

function formatDistance(nm) {
  if (nm < 1) return 'less than one nautical mile';
  return `about ${nm} nautical mile${nm === 1 ? '' : 's'}`;
}

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Generates a kid-friendly script string for an enriched aircraft object.
 * @param {object} aircraft - output of processFlights() with distanceNm, friendlyType, interesting, interestingReason
 * @returns {string}
 */
function generateScript(aircraft) {
  const parts = [];
  const type = aircraft.friendlyType || 'airplane';
  const dist = formatDistance(aircraft.distanceNm);

  if (aircraft.interesting && aircraft.interestingReason) {
    if (aircraft.interestingReason === 'military') {
      parts.push('Heads up — there is a military airplane nearby!');
    } else if (aircraft.interestingReason === 'medical') {
      parts.push('There is a medical airplane nearby helping someone!');
    } else if (EMERGENCY_PHRASES[aircraft.interestingReason]) {
      parts.push(`Emergency! ${EMERGENCY_PHRASES[aircraft.interestingReason]}`);
    }
  }

  const distCap = dist.charAt(0).toUpperCase() + dist.slice(1);
  parts.push(`${distCap} away from you, there is a ${type} with the callsign ${aircraft.ident || aircraft.registration || 'unknown'}.`);

  if (aircraft.origin?.city && aircraft.destination?.city) {
    const dep = formatTime(aircraft.actual_off || aircraft.scheduled_off);
    const arr = formatTime(aircraft.estimated_on || aircraft.scheduled_on);
    let route = `This ${type} flew from ${aircraft.origin.city} and is heading to ${aircraft.destination.city}`;
    if (dep) route += `, departing at ${dep}`;
    if (arr) route += ` and expected to arrive at ${arr}`;
    parts.push(route + '.');
  }

  const altDesc = formatAltitude(aircraft.last_position?.altitude);
  if (altDesc) parts.push(`Right now it is flying at ${altDesc}.`);

  return parts.join(' ');
}

module.exports = { generateScript };
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern=scriptGenerator
# Expected: PASS — all tests pass
```

- [ ] **Step 5: Commit**

```bash
git add src/services/scriptGenerator.js tests/scriptGenerator.test.js
git commit -m "feat: kid-friendly aircraft script generator"
```

---

## Task 7: SSR Page Generator

**Files:**
- Create: `src/views/page.js`

The HTML page uses server-side template literals with an `esc()` helper on all external data.
Client-side DOM updates use `createElement` and `textContent` throughout — no dynamic string insertion into the DOM.

- [ ] **Step 1: Create `src/views/page.js`**

```js
/** Escape special HTML characters to prevent injection in server-rendered output. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function badgeHtml(aircraft, index) {
  const r = aircraft.interestingReason;
  if (r === 'emergency_7700') return '<span class="badge badge-emergency">&#x1F6A8; EMERGENCY</span>';
  if (r === 'emergency_7500') return '<span class="badge badge-emergency">&#x1F6A8; HIJACK ALERT</span>';
  if (r === 'emergency_7600') return '<span class="badge badge-emergency">&#x1F6A8; RADIO LOST</span>';
  if (r === 'military')       return '<span class="badge badge-military">&#x1F1FA;&#x1F1F8; MILITARY</span>';
  if (r === 'medical')        return '<span class="badge badge-medical">&#x1F3E5; MEDICAL</span>';
  return `<span class="badge badge-rank">#${index + 1} Closest</span>`;
}

/** Render a single aircraft card as an HTML string (server-side). */
function renderCard(aircraft, index) {
  const a = aircraft;
  const r = a.interestingReason;
  const cardClass = ['card',
    r && r.startsWith('emergency') ? 'emergency' : '',
    r === 'military' ? 'military' : '',
    r === 'medical'  ? 'medical'  : '',
  ].filter(Boolean).join(' ');

  const lat = a.last_position?.latitude ?? '';
  const lon = a.last_position?.longitude ?? '';

  const metaParts = [
    esc(a.friendlyType),
    a.distanceNm ? esc(a.distanceNm + ' nm away') : null,
    a.last_position?.altitude ? esc((a.last_position.altitude * 100).toLocaleString() + ' ft') : null,
    a.origin && a.destination
      ? esc((a.origin.city || a.origin.code) + ' \u2192 ' + (a.destination.city || a.destination.code))
      : null,
  ].filter(Boolean).join(' &middot; ');

  // FA URL is constructed by us and always starts with https://www.flightaware.com/
  const safeUrl = (a.flightawareUrl || '').startsWith('https://') ? esc(a.flightawareUrl) : '#';

  return `<div class="${esc(cardClass)}" data-ident="${esc(a.ident)}" data-lat="${esc(String(lat))}" data-lon="${esc(String(lon))}" onclick="toggleCard(this)">
  <div class="card-header">
    <div class="card-title">
      &#x2708;&#xFE0F; ${esc(a.ident)}
      <a class="fa-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="View on FlightAware">
        <img src="/fa-logo.png" alt="FlightAware" onerror="this.style.display='none'">
      </a>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      ${badgeHtml(a, index)}
      <span class="card-chevron">&#x25BC;</span>
    </div>
  </div>
  <div class="card-body">
    <div class="card-meta">${metaParts}</div>
    <div class="card-script">${esc(a.script || '')}</div>
  </div>
</div>`;
}

/**
 * Render the full SSR HTML page.
 * @param {{location, theme, aircraft, cachedAt, expiresAt}} data
 * @returns {string}
 */
function renderPage(data) {
  const { location, theme, aircraft, expiresAt } = data;
  const locationLabel = esc([location.city, location.state].filter(Boolean).join(', '));

  // Aircraft JSON embedded for client-side use.
  // Only lat/lon/ident/distanceNm/script/flightawareUrl/interestingReason are needed client-side.
  const clientAircraft = aircraft.map(a => ({
    ident: a.ident,
    friendlyType: a.friendlyType,
    distanceNm: a.distanceNm,
    interesting: a.interesting,
    interestingReason: a.interestingReason,
    flightawareUrl: a.flightawareUrl,
    script: a.script,
    origin: a.origin ? { code: a.origin.code, city: a.origin.city } : null,
    destination: a.destination ? { code: a.destination.code, city: a.destination.city } : null,
    last_position: a.last_position
      ? { latitude: a.last_position.latitude, longitude: a.last_position.longitude, altitude: a.last_position.altitude }
      : null,
  }));

  const embeddedJson = JSON.stringify({ aircraft: clientAircraft, location, expiresAt });

  const cardsHtml = aircraft.length === 0
    ? '<div class="empty-state"><div class="emoji">&#x1F324;&#xFE0F;</div><p>The skies above you are quiet right now &#x2014; check back soon!</p></div>'
    : aircraft.map((a, i) => renderCard(a, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planes Near ${locationLabel || 'You'}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""><\/script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;min-height:100vh;transition:background .3s}

    /* Day theme */
    body.theme-day{background:linear-gradient(180deg,#87CEEB 0%,#B0E2FF 60%,#e8f8e8 100%);color:#1a1a2e}
    body.theme-day .card{background:rgba(255,255,255,.92)}
    body.theme-day header{background:rgba(255,255,255,.6);backdrop-filter:blur(8px)}

    /* Night theme */
    body.theme-night{background:linear-gradient(180deg,#0a0a2e 0%,#1a1a4e 60%,#0d2137 100%);color:#e0e8ff}
    body.theme-night .card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#e0e8ff}
    body.theme-night header{background:rgba(0,0,30,.6);backdrop-filter:blur(8px)}
    body.theme-night .card-meta{color:#aac}
    body.theme-night .card-script{color:#ccd}
    body.theme-night::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(1px 1px at 10% 15%,white 0%,transparent 100%),
        radial-gradient(1px 1px at 30% 8%,white 0%,transparent 100%),
        radial-gradient(1px 1px at 55% 20%,white 0%,transparent 100%),
        radial-gradient(2px 2px at 75% 5%,rgba(255,255,200,.7) 0%,transparent 100%),
        radial-gradient(1px 1px at 90% 18%,white 0%,transparent 100%);opacity:.5}

    /* Basic theme */
    body.theme-basic{background:#f5f7fa;color:#1a1a1a}
    body.theme-basic .card{background:#fff;border:1px solid #e0e4ea}
    body.theme-basic header{background:#2563eb;color:#fff}
    body.theme-basic header h1,body.theme-basic header p{color:#fff}
    body.theme-basic .theme-toggle{background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.4)}

    /* Layout */
    header{position:sticky;top:0;z-index:100;padding:12px 20px;display:flex;align-items:center;
      justify-content:space-between;flex-wrap:wrap;gap:8px;border-bottom:1px solid rgba(0,0,0,.08)}
    .header-left h1{font-size:1.2rem;font-weight:700}
    .header-left p{font-size:.8rem;opacity:.75;margin-top:2px}
    .header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

    .theme-toggle,.reload-btn{font-size:.75rem;padding:5px 12px;border-radius:20px;cursor:pointer;
      border:1px solid currentColor;background:transparent;color:inherit}
    .reload-btn:disabled{opacity:.45;cursor:not-allowed}

    .main-layout{position:relative;z-index:1;display:grid;grid-template-columns:380px 1fr;height:calc(100vh - 60px)}
    @media(max-width:767px){
      .main-layout{grid-template-columns:1fr;grid-template-rows:300px 1fr;height:auto}
      .map-pane{order:-1}
      .cards-pane{height:auto;overflow:visible}
    }
    .cards-pane{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
    .map-pane{position:relative}
    #map{width:100%;height:100%;min-height:300px}

    /* Cards */
    .card{border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;cursor:pointer;
      transition:transform .15s,box-shadow .15s}
    .card:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15)}
    .card.emergency{border-left:4px solid #dc2626}
    .card.military{border-left:4px solid #1d4ed8}
    .card.medical{border-left:4px solid #16a34a}
    .card-header{padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}
    .card-title{font-weight:700;font-size:.95rem;display:flex;align-items:center;gap:6px}
    .fa-link{display:inline-flex;align-items:center;opacity:.75}
    .fa-link:hover{opacity:1}
    .fa-link img{width:14px;height:14px;vertical-align:middle}
    .badge{font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:10px;white-space:nowrap}
    .badge-emergency{background:#dc2626;color:#fff}
    .badge-military{background:#1d4ed8;color:#fff}
    .badge-medical{background:#16a34a;color:#fff}
    .badge-rank{background:rgba(0,0,0,.12);color:inherit}
    .card-chevron{font-size:.75rem;transition:transform .2s;flex-shrink:0}
    .card.open .card-chevron{transform:rotate(180deg)}
    .card-body{display:none;padding:0 14px 12px}
    .card.open .card-body{display:block}
    .card-meta{font-size:.8rem;opacity:.75;margin-bottom:6px;line-height:1.5}
    .card-script{font-size:.85rem;line-height:1.6;border-top:1px solid rgba(0,0,0,.08);
      padding-top:8px;margin-top:8px;font-style:italic}
    .empty-state{text-align:center;padding:40px 20px;opacity:.7}
    .empty-state .emoji{font-size:3rem;margin-bottom:12px}
  </style>
</head>
<body class="theme-${esc(theme)}">
<header>
  <div class="header-left">
    <h1>&#x2708;&#xFE0F; Planes Near ${locationLabel || 'You'}</h1>
    <p id="update-time">Updated just now</p>
  </div>
  <div class="header-right">
    <button class="theme-toggle" onclick="toggleTheme()" id="theme-btn">Switch to Basic View</button>
    <button class="reload-btn" id="reload-btn" onclick="reloadData()" disabled>Reload &#x2014; loading&hellip;</button>
  </div>
</header>

<div class="main-layout">
  <div class="cards-pane" id="cards-pane">
    ${cardsHtml}
  </div>
  <div class="map-pane"><div id="map"></div></div>
</div>

<script id="pnp-data" type="application/json">${embeddedJson}<\/script>
<script>
(function () {
  // ── Constants & refs ─────────────────────────────────────────────────────
  const BASIC_KEY = 'pnp-basic-theme';
  const SERVER_THEME = ${JSON.stringify(theme)};
  const themeBtn = document.getElementById('theme-btn');
  const reloadBtn = document.getElementById('reload-btn');
  let expiresAt = ${JSON.stringify(expiresAt)};

  // ── Apply stored theme before first paint ─────────────────────────────────
  if (localStorage.getItem(BASIC_KEY) === '1') {
    document.body.classList.remove('theme-day', 'theme-night');
    document.body.classList.add('theme-basic');
    themeBtn.textContent = 'Switch to Themed View';
  }

  // ── Theme toggle ──────────────────────────────────────────────────────────
  window.toggleTheme = function () {
    const isBasic = document.body.classList.contains('theme-basic');
    if (isBasic) {
      document.body.classList.remove('theme-basic');
      document.body.classList.add('theme-' + SERVER_THEME);
      localStorage.setItem(BASIC_KEY, '0');
      themeBtn.textContent = 'Switch to Basic View';
    } else {
      document.body.classList.remove('theme-day', 'theme-night');
      document.body.classList.add('theme-basic');
      localStorage.setItem(BASIC_KEY, '1');
      themeBtn.textContent = 'Switch to Themed View';
    }
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  function updateCountdown() {
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      reloadBtn.disabled = false;
      reloadBtn.textContent = 'Reload Now \u21BA';
    } else {
      const s = Math.ceil(msLeft / 1000);
      const m = Math.floor(s / 60);
      reloadBtn.textContent = 'Reload \u2014 available in ' + m + ':' + String(s % 60).padStart(2, '0');
      setTimeout(updateCountdown, 1000);
    }
  }
  updateCountdown();

  // ── Reload handler ────────────────────────────────────────────────────────
  window.reloadData = async function () {
    if (reloadBtn.disabled) return;
    reloadBtn.disabled = true;
    reloadBtn.textContent = 'Loading\u2026';
    try {
      const res = await fetch('/api/aircraft');
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      expiresAt = data.expiresAt;
      rebuildCards(data.aircraft);
      rebuildMarkers(data.aircraft);
      document.getElementById('update-time').textContent = 'Updated just now';
      updateCountdown();
    } catch (_e) {
      reloadBtn.disabled = false;
      reloadBtn.textContent = 'Retry \u21BA';
    }
  };

  // ── Card expand/collapse ──────────────────────────────────────────────────
  window.toggleCard = function (el) {
    el.classList.toggle('open');
    if (el.classList.contains('open')) {
      const lat = parseFloat(el.dataset.lat);
      const lon = parseFloat(el.dataset.lon);
      if (!isNaN(lat) && !isNaN(lon) && window._map) {
        window._map.setView([lat, lon], 13);
        const marker = window._markers && window._markers[el.dataset.ident];
        if (marker) marker.openPopup();
      }
    }
  };

  // ── Leaflet map ───────────────────────────────────────────────────────────
  const rawData = JSON.parse(document.getElementById('pnp-data').textContent);
  const loc = rawData.location;

  const map = L.map('map').setView([loc.lat, loc.lon], 11);
  window._map = map;
  window._markers = {};

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  L.circleMarker([loc.lat, loc.lon], {
    radius: 8, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9,
  }).bindPopup('\uD83D\uDCCD Your location').addTo(map);

  window._aircraftLayer = L.layerGroup().addTo(map);

  function rebuildMarkers(aircraft) {
    window._aircraftLayer.clearLayers();
    window._markers = {};
    (aircraft || []).forEach(function (a) {
      if (!a.last_position) return;
      const lat = a.last_position.latitude;
      const lon = a.last_position.longitude;
      const icon = L.divIcon({
        className: '',
        html: '<div style="font-size:18px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4))">\u2708\uFE0F</div>',
        iconSize: [20, 20], iconAnchor: [10, 10],
      });
      const label = a.ident + ' \u2022 ' + a.friendlyType + ' \u2022 ' + a.distanceNm + ' nm';
      const marker = L.marker([lat, lon], { icon }).bindPopup(label);
      marker.on('click', function () {
        const card = document.querySelector('[data-ident="' + a.ident + '"]');
        if (card) { card.classList.add('open'); card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      });
      marker.addTo(window._aircraftLayer);
      window._markers[a.ident] = marker;
    });
  }

  // ── Card DOM builder (no string-to-DOM injection) ─────────────────────────
  function makeBadge(a, index) {
    const span = document.createElement('span');
    span.className = 'badge';
    const r = a.interestingReason;
    if (r === 'emergency_7700') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 EMERGENCY'; }
    else if (r === 'emergency_7500') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 HIJACK ALERT'; }
    else if (r === 'emergency_7600') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 RADIO LOST'; }
    else if (r === 'military')       { span.className += ' badge-military'; span.textContent = '\uD83C\uDDFA\uD83C\uDDF8 MILITARY'; }
    else if (r === 'medical')        { span.className += ' badge-medical'; span.textContent = '\uD83C\uDFE5 MEDICAL'; }
    else { span.className += ' badge-rank'; span.textContent = '#' + (index + 1) + ' Closest'; }
    return span;
  }

  function makeCardElement(a, index) {
    const r = a.interestingReason;
    const classes = ['card',
      r && r.startsWith('emergency') ? 'emergency' : '',
      r === 'military' ? 'military' : '',
      r === 'medical'  ? 'medical'  : '',
    ].filter(Boolean).join(' ');

    const card = document.createElement('div');
    card.className = classes;
    card.dataset.ident = a.ident || '';
    card.dataset.lat = String(a.last_position?.latitude ?? '');
    card.dataset.lon = String(a.last_position?.longitude ?? '');
    card.addEventListener('click', function () { window.toggleCard(this); });

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'card-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    titleDiv.appendChild(document.createTextNode('\u2708\uFE0F ' + (a.ident || 'Unknown')));

    // FA link — href is always https://www.flightaware.com/... constructed by server
    if (a.flightawareUrl && a.flightawareUrl.startsWith('https://')) {
      const link = document.createElement('a');
      link.className = 'fa-link';
      link.href = a.flightawareUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'View on FlightAware';
      link.addEventListener('click', function (e) { e.stopPropagation(); });
      const img = document.createElement('img');
      img.src = '/fa-logo.png';
      img.alt = 'FlightAware';
      img.addEventListener('error', function () { this.style.display = 'none'; });
      link.appendChild(img);
      titleDiv.appendChild(link);
    }

    const badgeGroup = document.createElement('div');
    badgeGroup.style.cssText = 'display:flex;align-items:center;gap:6px';
    const chevron = document.createElement('span');
    chevron.className = 'card-chevron';
    chevron.textContent = '\u25BC';
    badgeGroup.append(makeBadge(a, index), chevron);
    hdr.append(titleDiv, badgeGroup);

    // Body
    const body = document.createElement('div');
    body.className = 'card-body';

    const metaParts = [
      a.friendlyType,
      a.distanceNm ? a.distanceNm + ' nm away' : null,
      a.last_position?.altitude ? (a.last_position.altitude * 100).toLocaleString() + ' ft' : null,
      a.origin && a.destination
        ? (a.origin.city || a.origin.code) + ' \u2192 ' + (a.destination.city || a.destination.code)
        : null,
    ].filter(Boolean);

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = metaParts.join(' \u00b7 ');

    const scriptEl = document.createElement('div');
    scriptEl.className = 'card-script';
    scriptEl.textContent = a.script || '';

    body.append(meta, scriptEl);
    card.append(hdr, body);
    return card;
  }

  function rebuildCards(aircraft) {
    const pane = document.getElementById('cards-pane');
    pane.replaceChildren();
    if (!aircraft || aircraft.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const emoji = document.createElement('div');
      emoji.className = 'emoji';
      emoji.textContent = '\u{1F324}\uFE0F';
      const msg = document.createElement('p');
      msg.textContent = 'The skies above you are quiet right now \u2014 check back soon!';
      empty.append(emoji, msg);
      pane.appendChild(empty);
      return;
    }
    aircraft.forEach(function (a, i) { pane.appendChild(makeCardElement(a, i)); });
    const first = pane.querySelector('.card');
    if (first) first.classList.add('open');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  rebuildMarkers(rawData.aircraft);
  const firstCard = document.querySelector('.card');
  if (firstCard) firstCard.classList.add('open');
})();
<\/script>
</body>
</html>`;
}

module.exports = { renderPage, renderCard };
```

- [ ] **Step 2: Commit**

```bash
git add src/views/page.js
git commit -m "feat: SSR page — three themes, Leaflet map, safe DOM card builder"
```

---

## Task 8: Express Routes

**Files:**
- Modify: `src/server.js`
- Create: `tests/routes.test.js`

- [ ] **Step 1: Write failing integration tests**

Create `tests/routes.test.js`:

```js
jest.mock('../src/services/geolocation', () => ({ getGeolocation: jest.fn() }));
jest.mock('../src/services/flightaware', () => ({ getNearbyFlights: jest.fn() }));
jest.mock('../src/services/aircraft',    () => ({ processFlights: jest.fn() }));
jest.mock('../src/services/scriptGenerator', () => ({ generateScript: jest.fn() }));

const { getGeolocation } = require('../src/services/geolocation');
const { getNearbyFlights } = require('../src/services/flightaware');
const { processFlights } = require('../src/services/aircraft');
const { generateScript } = require('../src/services/scriptGenerator');
const request = require('supertest');

const MOCK_LOC = { lat: 32.78, lon: -96.80, city: 'Dallas', state: 'Texas', theme: 'day' };
const MOCK_AIRCRAFT = [{
  ident: 'DAL247', friendlyType: 'Boeing 737', distanceNm: 1.2,
  interesting: false, interestingReason: null,
  flightawareUrl: 'https://www.flightaware.com/live/flight/DAL247',
  last_position: { latitude: 32.91, longitude: -96.65, altitude: 280, groundspeed: 430 },
  origin: { code: 'KATL', city: 'Atlanta' }, destination: { code: 'KDFW', city: 'Dallas' },
}];

let app;
beforeAll(() => { app = require('../src/server'); });

beforeEach(() => {
  jest.clearAllMocks();
  getGeolocation.mockResolvedValue(MOCK_LOC);
  getNearbyFlights.mockResolvedValue([]);
  processFlights.mockReturnValue(MOCK_AIRCRAFT);
  generateScript.mockReturnValue('About 1.2 nautical miles away...');
});

test('GET /health returns 200 with status ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('GET /api/aircraft returns JSON with required fields', async () => {
  const res = await request(app).get('/api/aircraft?ip=8.8.8.8');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('aircraft');
  expect(res.body).toHaveProperty('location');
  expect(res.body).toHaveProperty('cachedAt');
  expect(res.body).toHaveProperty('expiresAt');
  expect(Array.isArray(res.body.aircraft)).toBe(true);
});

test('GET /api/aircraft aircraft have script field', async () => {
  const res = await request(app).get('/api/aircraft?ip=8.8.8.8');
  expect(res.body.aircraft[0]).toHaveProperty('script');
});

test('GET / returns HTML containing location', async () => {
  const res = await request(app).get('/?ip=8.8.8.8');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/html/);
  expect(res.text).toContain('Planes Near');
  expect(res.text).toContain('Dallas');
});

test('GET / uses cache on second identical request', async () => {
  await request(app).get('/?ip=5.5.5.5');
  await request(app).get('/?ip=5.5.5.5');
  expect(getGeolocation).toHaveBeenCalledTimes(1);
});

test('GET /api/aircraft returns 500 on geolocation failure', async () => {
  getGeolocation.mockRejectedValueOnce(new Error('Geo failed'));
  const res = await request(app).get('/api/aircraft?ip=9.9.9.9');
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('error');
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --testPathPattern=routes
# Expected: FAIL — routes not implemented yet
```

- [ ] **Step 3: Replace `src/server.js` with full implementation**

```js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { Cache } = require('./cache');
const { getGeolocation } = require('./services/geolocation');
const { getNearbyFlights } = require('./services/flightaware');
const { processFlights } = require('./services/aircraft');
const { generateScript } = require('./services/scriptGenerator');
const { renderPage } = require('./views/page');

const app = express();
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, '..', 'public')));

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Cache(CACHE_TTL_MS);
const PORT = process.env.PORT || 3000;

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Core fetch logic ──────────────────────────────────────────────────────
async function buildAircraftData(ip) {
  const cached = cache.get(ip);
  if (cached) return cached;

  const location = await getGeolocation(ip);
  const rawFlights = await getNearbyFlights(location.lat, location.lon);
  const processed = processFlights(rawFlights, location.lat, location.lon);
  const aircraft = processed.map(a => ({ ...a, script: generateScript(a) }));

  const cachedAt = Date.now();
  const data = { location, aircraft, theme: location.theme, cachedAt, expiresAt: cachedAt + CACHE_TTL_MS };
  cache.set(ip, data);
  return data;
}

function clientIp(req) {
  return req.query.ip || req.ip || '0.0.0.0';
}

// ── GET /api/aircraft ─────────────────────────────────────────────────────
app.get('/api/aircraft', async (req, res) => {
  const ip = clientIp(req);
  try {
    const data = await buildAircraftData(ip);
    const meta = cache.getMetadata(ip);
    res.json({ ...data, expiresAt: meta?.expiresAt ?? data.expiresAt });
  } catch (err) {
    console.error('[/api/aircraft]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET / ─────────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  const ip = clientIp(req);
  try {
    const data = await buildAircraftData(ip);
    const meta = cache.getMetadata(ip);
    res.send(renderPage({ ...data, expiresAt: meta?.expiresAt ?? data.expiresAt }));
  } catch (err) {
    console.error('[/]', err.message);
    res.status(500).send(`<!DOCTYPE html><html><body><h1>Something went wrong</h1><p>${err.message}</p><p><a href="/">Try again</a></p></body></html>`);
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`PlanesNearbyPodcast running on port ${PORT}`));
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test
# Expected: PASS — all suites pass
```

- [ ] **Step 5: Commit**

```bash
git add src/server.js tests/routes.test.js
git commit -m "feat: Express routes — GET /, /api/aircraft, /health with TTL cache"
```

---

## Task 9: Public Assets & GitHub Actions

**Files:**
- Create: `public/fa-logo.png`
- Create: `.github/workflows/preview-comment.yml`

- [ ] **Step 1: Download FlightAware favicon**

```bash
mkdir -p public
curl -L -o public/fa-logo.png "https://www.flightaware.com/favicon.ico"
# Verify it downloaded (should be > 0 bytes):
ls -lh public/fa-logo.png
```

If curl fails (network restriction), download `https://www.flightaware.com/favicon.ico` manually in a browser and save as `public/fa-logo.png`.

- [ ] **Step 2: Create `.github/workflows/preview-comment.yml`**

```yaml
name: Railway Preview Comment

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write

jobs:
  post-preview-url:
    runs-on: ubuntu-latest
    steps:
      - name: Poll Railway for preview deployment URL
        id: get-url
        uses: actions/github-script@v7
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          RAILWAY_PROJECT_ID: ${{ secrets.RAILWAY_PROJECT_ID }}
        with:
          result-encoding: string
          script: |
            const branch = context.payload.pull_request.head.ref;
            const branchSlug = branch.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
            const maxAttempts = 20;   // 20 x 15s = 5 min max wait
            const delayMs = 15000;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              if (attempt > 0) await new Promise(r => setTimeout(r, delayMs));

              const res = await fetch('https://backboard.railway.app/graphql/v2', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + process.env.RAILWAY_TOKEN,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: '{project(id:"' + process.env.RAILWAY_PROJECT_ID + '"){environments{edges{node{name deployments(first:3){edges{node{status staticUrl}}}}}}}}' }),
              });

              const json = await res.json();
              const envs = json?.data?.project?.environments?.edges ?? [];

              for (const env of envs) {
                if (!env.node.name.toLowerCase().includes(branchSlug)) continue;
                for (const dep of env.node.deployments.edges) {
                  if (dep.node.status === 'SUCCESS' && dep.node.staticUrl) {
                    return 'https://' + dep.node.staticUrl;
                  }
                }
              }
            }
            return '';

      - name: Find existing preview comment
        uses: peter-evans/find-comment@v3
        id: find-comment
        with:
          issue-number: ${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: 'Railway Preview'

      - name: Post or update preview comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: ${{ steps.find-comment.outputs.comment-id }}
          issue-number: ${{ github.event.pull_request.number }}
          edit-mode: replace
          body: |
            ## ${{ '\U0001F682' }} Railway Preview Deployment

            ${{ steps.get-url.outputs.result != '' && format('**Preview URL:** {0}', steps.get-url.outputs.result) || ':hourglass: Deployment still building — check the [Railway dashboard](https://railway.app) or re-push to retry.' }}

            _Branch: `${{ github.head_ref }}` | Triggered by push to `${{ github.sha }}`_
```

- [ ] **Step 3: Commit**

```bash
git add public/fa-logo.png .github/workflows/preview-comment.yml
git commit -m "feat: FlightAware favicon and Railway PR preview comment workflow"
```

---

## Task 10: README, CLAUDE.md, Final Polish

**Files:**
- Create: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Planes Nearby Podcast

A kid-friendly web app that finds aircraft near your location and describes them in fun, plain language.

## What It Does

1. Detects your approximate location from your IP (IPGeolocation.io)
2. Finds aircraft within 10 nautical miles via FlightAware AeroAPI
3. Highlights the 5 closest planes plus any interesting ones (emergencies, military, medical)
4. Generates a kid-friendly description for each plane
5. Caches results per visitor per 5 minutes to keep API calls low
6. Shows a live Leaflet map with each aircraft plotted

## Prerequisites

- Node.js 20+, npm
- [Railway](https://railway.app) account (free tier works)
- [GitHub](https://github.com) account

## API Keys

### IPGeolocation.io
1. Create a free account at [ipgeolocation.io](https://ipgeolocation.io)
2. Copy your API key from the dashboard
3. Free tier: 1,000 requests/day

### FlightAware AeroAPI
1. Sign up at [flightaware.com/aeroapi](https://www.flightaware.com/aeroapi/)
2. Create an API key in Account Settings
3. **Note:** AeroAPI is a paid service. Each unique visitor triggers one search request per 5-minute window.

## Local Development

    git clone https://github.com/YOUR_USERNAME/PlanesNearbyPodcast.git
    cd PlanesNearbyPodcast
    npm install
    cp .env.example .env        # then fill in your two API keys
    npm run dev
    # Open: http://localhost:3000?ip=8.8.8.8
    # (127.0.0.1 cannot be geolocated — use ?ip= to test)

    npm test                    # run all tests
    npm test -- --testPathPattern=cache   # run one test file

## Deploy to Railway

**Step 1 — Push to GitHub**
Make sure your repo is on GitHub.

**Step 2 — Create Railway project**
- Log in to railway.app
- Click New Project > Deploy from GitHub repo
- Select PlanesNearbyPodcast

**Step 3 — Set environment variables**
In your Railway service > Variables tab, add:

| Name | Value |
|---|---|
| IPGEO_API_KEY | Your IPGeolocation.io key |
| FLIGHTAWARE_API_KEY | Your FlightAware AeroAPI key |

Railway injects PORT and NODE_ENV automatically.

**Step 4 — Enable PR preview deployments**
In Railway project Settings > find Preview Environments and toggle it ON.

**Step 5 — Add GitHub secrets for PR preview comments**

Get your Railway token: Railway dashboard > avatar (top-right) > Account Settings > Tokens > Create Token

Get your Railway project ID: Railway dashboard > your project > Settings tab > Project ID

In your GitHub repo > Settings > Secrets and variables > Actions, add:

| Secret name | Value |
|---|---|
| RAILWAY_TOKEN | Your Railway token |
| RAILWAY_PROJECT_ID | Your Railway project ID |

When you open a PR, a bot will post a comment with the preview URL once the deployment is ready.

**Step 6 — Verify**
Open the deployment URL from your Railway dashboard. You should see aircraft data for your location.

## Project Structure

    src/
      server.js              Express app and routes
      cache.js               In-memory 5-minute TTL cache
      services/
        geolocation.js       IPGeolocation.io integration
        flightaware.js       FlightAware AeroAPI integration
        aircraft.js          Filtering, sorting, Haversine distance
        scriptGenerator.js   Kid-friendly text generation
      views/
        page.js              SSR HTML page generator
    public/
      fa-logo.png            FlightAware attribution logo
    tests/                   Jest test suite

## Future: Audio / Yoto Expansion

The /api/aircraft endpoint already returns a `script` field on each aircraft.
To add audio output when ready:

1. Call GET /api/aircraft
2. Pass each aircraft.script to ElevenLabs or Google TTS
3. Stitch returned audio into an MP3
4. Add a GET /api/podcast.mp3 route

No changes to existing code are needed — the TTS route slots in alongside what is already there.
```

- [ ] **Step 2: Update `CLAUDE.md`**

Replace the entire file:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PlanesNearbyPodcast — Node.js/Express web app that geolocates visitors via IPGeolocation.io, finds nearby aircraft via FlightAware AeroAPI, and renders a kid-friendly themed page with a Leaflet map.

## Commands

    npm start                                       # production server
    npm run dev                                     # dev server with auto-reload (nodemon)
    npm test                                        # run all Jest tests
    npm test -- --testPathPattern=cache             # run one test file by name

## Architecture

- `src/server.js` — Express app, routes, IP detection, cache wiring
- `src/cache.js` — In-memory TTL Map (5 min default), keyed by IP; `get`, `set`, `getMetadata`, `sweep`, `clear`
- `src/services/geolocation.js` — IPGeolocation.io API; returns `{lat, lon, city, state, theme}`
- `src/services/flightaware.js` — FlightAware AeroAPI `/flights/search` with `-latlong` FLIFO query
- `src/services/aircraft.js` — Haversine distance, interesting tagging (emergency/military/medical), sort, dedup
- `src/services/scriptGenerator.js` — Aircraft object to kid-friendly English string
- `src/views/page.js` — Full SSR HTML string with embedded JSON for client hydration

## Key Behaviours

- `GET /` serves SSR HTML; `GET /api/aircraft` returns the same data as JSON (used by refresh + future TTS)
- `?ip=8.8.8.8` query param overrides IP detection — required for localhost testing
- `last_position.altitude` from FlightAware is in hundreds of feet (280 = 28,000 ft)
- Aircraft data embedded in page as `<script id="pnp-data" type="application/json">` — parsed client-side
- Theme (`day`/`night`) calculated server-side via `suncalc` using user lat/lon
- Client-side DOM updates use `createElement`/`textContent` throughout

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `IPGEO_API_KEY` | Yes | IPGeolocation.io dashboard |
| `FLIGHTAWARE_API_KEY` | Yes | FlightAware AeroAPI dashboard |
| `PORT` | No | Injected by Railway automatically |

## Deployment

Railway via GitHub integration — push to `main` auto-deploys. PR previews are enabled; `.github/workflows/preview-comment.yml` posts the preview URL as a PR comment (requires `RAILWAY_TOKEN` and `RAILWAY_PROJECT_ID` GitHub secrets).
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
# Expected: PASS — all suites pass, no failures
```

- [ ] **Step 4: Final commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: README with full setup guide, update CLAUDE.md"
```

---

## Self-Review

### Spec Coverage

| Spec requirement | Task |
|---|---|
| IPGeolocation.io integration | Task 3 |
| FlightAware AeroAPI nearby search | Task 4 |
| Haversine distance calculation | Task 5 |
| Top 5 + interesting aircraft selection | Task 5 |
| Emergency / military / medical tagging | Task 5 |
| De-duplication of interesting + top-5 | Task 5 |
| Kid-friendly script generation | Task 6 |
| SSR HTML page | Task 7 |
| Three themes (day / night / basic) | Task 7 |
| Day/night via suncalc | Tasks 3 + 7 |
| Theme toggle + localStorage | Task 7 |
| Leaflet map with aircraft markers | Task 7 |
| Side-by-side desktop / stacked mobile | Task 7 |
| FlightAware logo attribution link | Task 7 |
| Card expand/collapse; first auto-open | Task 7 |
| Click card pans map to aircraft | Task 7 |
| Click map marker expands card | Task 7 |
| Reload button with countdown | Task 7 |
| Reload calls /api/aircraft, no page reload | Tasks 7 + 8 |
| In-memory TTL cache keyed by IP | Task 2 |
| GET /api/aircraft JSON endpoint | Task 8 |
| GET /health for Railway | Tasks 1 + 8 |
| ?ip= override for dev/testing | Task 8 |
| Railway config (railway.toml) | Task 1 |
| PR preview comment workflow | Task 9 |
| README with step-by-step setup | Task 10 |
| CLAUDE.md updated | Task 10 |
| Future TTS path preserved | Tasks 7 + 10 |
