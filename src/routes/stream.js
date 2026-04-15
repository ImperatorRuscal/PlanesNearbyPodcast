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
    aircraft.forEach((a, i) => {
      const trackIndex = i + 1;
      if (audioStore.getPromise(ip, trackIndex) !== null) return; // already in-flight or cached
      const promise = synthesize(a.script).catch(err => {
        console.warn(`[stream] TTS failed for ${ip} track ${trackIndex}:`, err.message);
        return null; // null sentinel → serve silence
      });
      audioStore.setPromise(ip, trackIndex, promise);
    });
  }

  // ── GET /stream/intro.mp3 ────────────────────────────────────────────────
  // Serve the static file immediately, then fire TTS generation in the
  // background — the intro's duration is the pre-warm window for synthesis.
  router.get('/intro.mp3', (req, res) => {
    const ip = clientIp(req);
    buildAircraftData(ip)
      .then(data => ensureGenerated(ip, data.aircraft || []))
      .catch(err => console.error('[stream] intro pre-warm failed:', err.message));
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

  // ── GET /stream/playlist.m3u ────────────────────────────────────────────
  router.get('/playlist.m3u', (req, res) => {
    const base = `${req.protocol}://${req.headers.host}`;
    const lines = ['#EXTM3U', `${base}/stream/intro.mp3`];
    for (let n = 1; n <= 10; n++) {
      lines.push(`${base}/stream/squelch-${n}.mp3`);
      lines.push(`${base}/stream/aircraft-${n}.mp3`);
    }
    res.set('Content-Type', 'audio/x-mpegurl');
    res.set('Content-Disposition', 'attachment; filename="planes-nearby.m3u"');
    res.send(lines.join('\r\n'));
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
    const promise = audioStore.getPromise(ip, n);
    if (promise) {
      let timeoutHandle;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('TTS timeout')), TRACK_TIMEOUT_MS);
      });
      try {
        buf = await Promise.race([promise, timeoutPromise]);
      } catch (err) {
        console.warn(`[stream] Timeout or error awaiting track ${n} for ${ip}:`, err.message);
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    if (!buf) return sendSilence(res);

    res.set('Content-Type', 'audio/mpeg');
    res.send(buf);
  });

  return router;
}

module.exports = { createStreamRouter };
