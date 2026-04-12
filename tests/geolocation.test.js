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
  country_code2: 'US',
};

test('returns location and theme:day when sun is up', async () => {
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE });
  SunCalc.getTimes.mockReturnValue({
    sunrise: new Date('2024-04-23T11:00:00Z'),
    sunset:  new Date('2024-04-23T23:30:00Z'),
  });
  const result = await getGeolocation('8.8.8.8', new Date('2024-04-23T14:00:00Z'));
  expect(result).toEqual({ lat: 32.7767, lon: -96.797, city: 'Dallas', state: 'Texas', countryCode: 'US', theme: 'day' });
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
