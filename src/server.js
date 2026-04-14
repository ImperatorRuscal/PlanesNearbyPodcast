require('dotenv').config();
const express = require('express');
const path = require('path');
const { Cache } = require('./cache');
const { getGeolocation } = require('./services/geolocation');
const { getNearbyFlights } = require('./services/flightaware');
const { processFlights } = require('./services/aircraft');
const { generateScript } = require('./services/scriptGenerator');
const { renderPage } = require('./views/page');
const { createStreamRouter } = require('./routes/stream');
const { audioStore }         = require('./services/audioStore');
const { synthesize }         = require('./services/tts');

const app = express();
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Stream router ─────────────────────────────────────────────────────────
const audioDir = path.join(__dirname, '..', 'public', 'audio');
app.use('/stream', createStreamRouter({ buildAircraftData, clientIp, audioStore, synthesize, audioDir }));

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MS || '') || 10 * 60 * 1000;
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
  const aircraft = processed.map(a => ({ ...a, script: generateScript(a, location.countryCode) }));

  const cachedAt = Date.now();
  const data = { location, aircraft, theme: location.theme, cachedAt, expiresAt: cachedAt + CACHE_TTL_MS };
  cache.set(ip, data);
  return data;
}

function clientIp(req) {
  const overrideAllowed = process.env.NODE_ENV !== 'production';
  if (overrideAllowed && req.query.ip) return req.query.ip;
  // X-Forwarded-For is "client, proxy1, proxy2, ..." — leftmost is always the real client.
  // Reading it directly avoids trust-proxy hop-count mismatches with Railway's multi-hop ingress.
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.ip || '0.0.0.0';
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
    res.status(500).send(`<!DOCTYPE html><html><body><h1>Something went wrong</h1><p>${escHtml(err.message)}</p><p><a href="/">Try again</a></p></body></html>`);
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`PlanesNearbyPodcast running on port ${PORT}`));
}
