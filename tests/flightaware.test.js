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
