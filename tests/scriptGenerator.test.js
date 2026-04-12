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

// ── generateScript ─────────────────────────────────────────────────────────────

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

test('expands known airline callsign in narrative', () => {
  // DAL247 → "Delta Air Lines 247"
  const s = generateScript(makeAircraft({ ident: 'DAL247' }));
  expect(s).toContain('Delta Air Lines 247');
  expect(s).not.toContain('callsign DAL247');
});

test('falls back to callsign label for unrecognised idents', () => {
  const s = generateScript(makeAircraft({ ident: 'N12345' }));
  expect(s).toContain('callsign N12345');
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
