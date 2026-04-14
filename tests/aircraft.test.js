const { haversineNm, tagInteresting, processFlights } = require('../src/services/aircraft');

describe('haversineNm', () => {
  test('returns 0 for same point', () => {
    expect(haversineNm(32.78, -96.80, 32.78, -96.80)).toBe(0);
  });

  test('antipodal points are > 10000 nm apart', () => {
    expect(haversineNm(0, 0, 0, 180)).toBeGreaterThan(10000);
  });

  test('DFW to DAL is roughly 9-12 nm', () => {
    const d = haversineNm(32.8998, -97.0403, 32.8471, -96.8517);
    expect(d).toBeGreaterThan(9);
    expect(d).toBeLessThan(12);
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

  test('TANDEM29 = military', () => {
    expect(tagInteresting({ ...base, ident: 'TANDEM29' }).interestingReason).toBe('military');
  });

  test('TANDM29 = military (AeroAPI-truncated TANDEM)', () => {
    expect(tagInteresting({ ...base, ident: 'TANDM29' }).interestingReason).toBe('military');
  });

  test('COWBOY12 = military', () => {
    expect(tagInteresting({ ...base, ident: 'COWBOY12' }).interestingReason).toBe('military');
  });

  test('ROPER21 = military (C-130, KNFW)', () => {
    expect(tagInteresting({ ...base, ident: 'ROPER21' }).interestingReason).toBe('military');
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

  test('known helicopter type code sets isHelicopter=true', () => {
    const f = makeFlight('N505FW', 32.79, -96.81, {
      aircraft_type: 'B505', origin: null, destination: null,
      last_position: { latitude: 32.79, longitude: -96.81, altitude: 8, groundspeed: 70 },
    });
    const result = processFlights([f], uLat, uLon);
    expect(result[0].isHelicopter).toBe(true);
  });

  test('heuristic detects no-type slow+low registration flight as helicopter (origin present, no destination)', () => {
    const f = makeFlight('N505FW', 32.79, -96.81, {
      aircraft_type: null, destination: null,
      last_position: { latitude: 32.79, longitude: -96.81, altitude: 8, groundspeed: 70 },
    });
    const result = processFlights([f], uLat, uLon);
    expect(result[0].isHelicopter).toBe(true);
    expect(result[0].friendlyType).toBe('helicopter');
  });

  test('heuristic does not flag fast high airline flight as helicopter', () => {
    const result = processFlights([makeFlight('DAL247', 32.79, -96.81)], uLat, uLon);
    expect(result[0].isHelicopter).toBe(false);
  });

  test('heuristic detects GPS-origin military helo at 131 kts (TANDM29 pattern)', () => {
    const f = makeFlight('TANDM29', 32.79, -96.81, {
      aircraft_type: null, destination: null,
      origin: { code: 'L 32.73108 -96.97865', city: 'Grand Prairie', name: null },
      last_position: { latitude: 32.79, longitude: -96.81, altitude: 14, groundspeed: 131 },
    });
    const result = processFlights([f], uLat, uLon);
    expect(result[0].isHelicopter).toBe(true);
  });

  test('heuristic does not flag 131 kt aircraft without GPS origin as helicopter', () => {
    // Same speed as TANDM29 but departing a real airport — should NOT be a helo
    const f = makeFlight('N12345', 32.79, -96.81, {
      aircraft_type: null, destination: null,
      origin: { code: 'KGPM', city: 'Grand Prairie', name: 'Grand Prairie Municipal' },
      last_position: { latitude: 32.79, longitude: -96.81, altitude: 14, groundspeed: 131 },
    });
    const result = processFlights([f], uLat, uLon);
    expect(result[0].isHelicopter).toBe(false);
  });

  test('heuristic does not flag 150+ kt GPS-origin aircraft as helicopter', () => {
    // Above the extended threshold even with GPS origin — not a helo
    const f = makeFlight('N12345', 32.79, -96.81, {
      aircraft_type: null, destination: null,
      origin: { code: 'L 32.73108 -96.97865', city: 'Grand Prairie', name: null },
      last_position: { latitude: 32.79, longitude: -96.81, altitude: 14, groundspeed: 155 },
    });
    const result = processFlights([f], uLat, uLon);
    expect(result[0].isHelicopter).toBe(false);
  });
});
