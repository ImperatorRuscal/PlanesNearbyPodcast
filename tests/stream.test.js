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
  // Reset the shared audioStore so each test starts with a clean cache
  const { audioStore } = require('../src/services/audioStore');
  audioStore.clear();
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
