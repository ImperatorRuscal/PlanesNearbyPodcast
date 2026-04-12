const { generateScript, expandCallsign, formatDistance } = require('../src/services/scriptGenerator');

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

// ── expandCallsign ────────────────────────────────────────────────────────────

test('expands known ICAO prefix to airline name', () => {
  expect(expandCallsign('AAL717')).toBe('American Airlines 717');
  expect(expandCallsign('DAL247')).toBe('Delta Air Lines 247');
  expect(expandCallsign('SWA1234')).toBe('Southwest Airlines 1234');
});

test('expands JSX callsign', () => {
  expect(expandCallsign('JSX123')).toBe('JSX 123');
});

test('expands JKA (LeTourneau University) callsign', () => {
  expect(expandCallsign('JKA10')).toBe('LeTourneau University 10');
});

test('returns original ident when prefix is unknown', () => {
  expect(expandCallsign('N12345')).toBe('N12345');
  expect(expandCallsign('XYZ999')).toBe('XYZ999');
});

test('returns "unknown" for null/empty ident', () => {
  expect(expandCallsign(null)).toBe('unknown');
  expect(expandCallsign('')).toBe('unknown');
});

// ── formatDistance ────────────────────────────────────────────────────────────

test('formatDistance uses miles for US', () => {
  const d = formatDistance(3.2, 'US');
  expect(d).toContain('mile');
  expect(d).not.toContain('nautical');
  expect(d).not.toContain('kilometer');
});

test('formatDistance uses kilometers for non-US country', () => {
  const d = formatDistance(3.2, 'GB');
  expect(d).toContain('kilometer');
  expect(d).not.toContain('mile');
});

test('formatDistance falls back to nautical miles when no country code', () => {
  const d = formatDistance(3.2);
  expect(d).toContain('nautical');
});

test('formatDistance sub-1 unit descriptions', () => {
  expect(formatDistance(0.4, 'US')).toMatch(/less than one mile/i);
  expect(formatDistance(0.4, 'GB')).toMatch(/less than one kilometer/i);
  expect(formatDistance(0.4)).toMatch(/less than one nautical mile/i);
});

// ── generateScript ────────────────────────────────────────────────────────────

test('includes aircraft type', () => {
  expect(generateScript(makeAircraft())).toContain('Boeing 737');
});

test('uses miles for US visitors', () => {
  const s = generateScript(makeAircraft({ distanceNm: 3.2 }), 'US');
  expect(s).toContain('mile');
  expect(s).not.toContain('nautical');
});

test('uses kilometers for non-US visitors', () => {
  const s = generateScript(makeAircraft({ distanceNm: 3.2 }), 'GB');
  expect(s).toContain('kilometer');
});

test('first mention uses full airline name', () => {
  const s = generateScript(makeAircraft({ ident: 'DAL247' }));
  expect(s).toContain('Delta Air Lines');
  expect(s).toContain('247');
});

test('subsequent mention uses radio callsign', () => {
  const s = generateScript(makeAircraft({ ident: 'DAL247' }));
  // Route sentence should use "Delta" not "Delta Air Lines"
  expect(s).toMatch(/Delta is flying from/);
});

test('full name appears before callsign in script', () => {
  const s = generateScript(makeAircraft({ ident: 'AAL717' }));
  const fullIdx = s.indexOf('American Airlines');
  const shortIdx = s.indexOf('American is flying');
  expect(fullIdx).toBeGreaterThanOrEqual(0);
  expect(shortIdx).toBeGreaterThan(fullIdx);
});

test('JSX uses correct name and callsign', () => {
  const s = generateScript(makeAircraft({ ident: 'JSX123' }));
  expect(s).toContain('JSX');
  expect(s).toMatch(/JSX Air is flying from/);
});

test('LeTourneau University uses correct name and callsign', () => {
  const s = generateScript(makeAircraft({ ident: 'JKA10' }));
  expect(s).toContain('LeTourneau University');
  expect(s).toMatch(/Jacket is flying from/);
});

test('falls back to callsign label for unrecognised idents', () => {
  const s = generateScript(makeAircraft({ ident: 'N12345' }));
  expect(s).toContain('callsign N12345');
  // Route sentence should fall back to "This [type]"
  expect(s).toMatch(/This Boeing 737 is flying from/);
});

test('includes origin and destination cities', () => {
  const s = generateScript(makeAircraft());
  expect(s).toContain('Atlanta');
  expect(s).toContain('Dallas');
});

test('shows arrival time not departure time in route sentence', () => {
  const s = generateScript(makeAircraft());
  expect(s).toContain('expected to arrive');
  expect(s).not.toMatch(/departing at/i);
});

test('includes altitude in feet', () => {
  expect(generateScript(makeAircraft())).toContain('28,000');
});

test('altitude phrases vary across different altitude bands', () => {
  const low  = generateScript(makeAircraft({ last_position: { altitude: 20 } }));   // 2000 ft
  const mid  = generateScript(makeAircraft({ last_position: { altitude: 80 } }));   // 8000 ft
  const high = generateScript(makeAircraft({ last_position: { altitude: 350 } }));  // 35000 ft
  // Each band should produce a distinct phrase
  expect(low).not.toEqual(mid);
  expect(mid).not.toEqual(high);
});

test('includes destination fun fact for known airport', () => {
  // KDFW is in AIRPORT_FACTS
  const s = generateScript(makeAircraft({ destination: { code: 'KDFW', city: 'Dallas' } }));
  expect(s).toContain('Fun fact about Dallas');
});

test('omits destination fun fact for emergency flights', () => {
  const s = generateScript(makeAircraft({ interesting: true, interestingReason: 'emergency_7700' }));
  expect(s).not.toContain('Fun fact');
});

test('omits destination fun fact for unknown airports', () => {
  const s = generateScript(makeAircraft({ destination: { code: 'ZZZZ', city: 'Nowhere' } }));
  expect(s).not.toContain('Fun fact');
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
