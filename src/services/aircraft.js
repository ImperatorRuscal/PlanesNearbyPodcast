const AIRCRAFT_NAMES = {
  A319:'Airbus A319', A320:'Airbus A320', A321:'Airbus A321',
  A332:'Airbus A330', A333:'Airbus A330', A343:'Airbus A340',
  A359:'Airbus A350', A380:'Airbus A380 Super Jumbo',
  B712:'Boeing 717', B737:'Boeing 737', B738:'Boeing 737-800',
  B739:'Boeing 737-900', B744:'Boeing 747 Jumbo Jet', B748:'Boeing 747-8',
  B752:'Boeing 757', B762:'Boeing 767', B763:'Boeing 767',
  B772:'Boeing 777', B773:'Boeing 777', B77W:'Boeing 777-300',
  B788:'Boeing 787 Dreamliner', B789:'Boeing 787 Dreamliner',
  B78X:'Boeing 787-10 Dreamliner',
  MD11:'McDonnell Douglas MD-11', MD88:'McDonnell Douglas MD-80',
  CRJ2:'Bombardier CRJ-200', CRJ7:'Bombardier CRJ-700', CRJ9:'Bombardier CRJ-900',
  E145:'Embraer ERJ-145', E170:'Embraer E170', E175:'Embraer E175',
  E190:'Embraer E190', E195:'Embraer E195',
  C172:'Cessna Skyhawk', C182:'Cessna Skylane', C208:'Cessna Caravan',
  PA28:'Piper Cherokee', BE36:'Beechcraft Bonanza', BE9L:'Beechcraft King Air',
  PC12:'Pilatus PC-12',
  C25B:'Cessna Citation CJ3', C550:'Cessna Citation II', C680:'Cessna Citation Sovereign',
  GLF4:'Gulfstream G-IV', GLF5:'Gulfstream G-V', GLF6:'Gulfstream G650',
  GLEX:'Bombardier Global Express', GL7T:'Bombardier Global 7500',
  LJ35:'Learjet 35', LJ45:'Learjet 45', F900:'Dassault Falcon 900',
  HDJT:'HondaJet',
  B06:'Bell 206 Helicopter', B407:'Bell 407 Helicopter',
  EC35:'Airbus H135 Helicopter', EC45:'Airbus H145 Helicopter',
  AS50:'Airbus AS350 Helicopter', S76:'Sikorsky S-76 Helicopter',
  S92:'Sikorsky S-92 Helicopter', R44:'Robinson R44 Helicopter',
  C17:'Boeing C-17 Globemaster', C130:'Lockheed C-130 Hercules',
  C5:'Lockheed C-5 Galaxy', B52:'Boeing B-52 Stratofortress',
  KC135:'Boeing KC-135 Stratotanker',
  A225:"Antonov An-225 — the World's Largest Airplane",
};

const EMERGENCY_SQUAWKS = {
  '7500': 'emergency_7500',
  '7600': 'emergency_7600',
  '7700': 'emergency_7700',
};

const MILITARY_PREFIXES = ['REACH','RCH','ARMY','NAVY','USMC','USCG','SAM','PAT','VENUS','JAKE','SPAR','EVAC','MAGMA'];
const MEDICAL_PREFIXES  = ['MEDEVAC','LIFEGUARD','AIRMED','MEDIVAC'];

/**
 * Haversine distance in nautical miles between two lat/lon points.
 */
function haversineNm(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns {interesting, interestingReason} for a raw AeroAPI flight.
 */
function tagInteresting(flight) {
  const ident = (flight.ident || '').toUpperCase();
  if (flight.squawk && EMERGENCY_SQUAWKS[flight.squawk]) {
    return { interesting: true, interestingReason: EMERGENCY_SQUAWKS[flight.squawk] };
  }
  if (MILITARY_PREFIXES.some(p => ident.startsWith(p))) {
    return { interesting: true, interestingReason: 'military' };
  }
  if (MEDICAL_PREFIXES.some(p => ident.startsWith(p))) {
    return { interesting: true, interestingReason: 'medical' };
  }
  return { interesting: false, interestingReason: null };
}

/**
 * Filter, enrich, and sort raw AeroAPI flights.
 * Returns: interesting aircraft (by distance) then top-5 closest, de-duped.
 *
 * @param {object[]} flights - raw AeroAPI flight objects
 * @param {number} userLat
 * @param {number} userLon
 * @returns {object[]}
 */
function processFlights(flights, userLat, userLon) {
  const airborne = flights.filter(f =>
    f.last_position &&
    typeof f.last_position.latitude === 'number' &&
    typeof f.last_position.longitude === 'number' &&
    f.last_position.altitude > 0
  );

  const enriched = airborne.map(f => {
    const dist = haversineNm(userLat, userLon, f.last_position.latitude, f.last_position.longitude);
    return {
      ...f,
      distanceNm: Math.round(dist * 10) / 10,
      friendlyType: AIRCRAFT_NAMES[f.aircraft_type] || f.aircraft_type || 'airplane',
      flightawareUrl: `https://www.flightaware.com/live/flight/${f.ident}`,
      ...tagInteresting(f),
    };
  });

  const interesting = enriched
    .filter(f => f.interesting)
    .sort((a, b) => a.distanceNm - b.distanceNm);

  const interestingIdents = new Set(interesting.map(f => f.ident));

  const top5 = enriched
    .filter(f => !f.interesting && !interestingIdents.has(f.ident))
    .sort((a, b) => a.distanceNm - b.distanceNm)
    .slice(0, 5);

  return [...interesting, ...top5];
}

module.exports = { haversineNm, tagInteresting, processFlights };
