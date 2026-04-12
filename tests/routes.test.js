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
