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
