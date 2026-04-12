const AIRCRAFT_NAMES = {
  // ── Airbus A220 (ex-Bombardier CSeries) ───────────────────────────────────
  BCS1:'Airbus A220-100', BCS3:'Airbus A220-300',

  // ── Airbus narrowbody ─────────────────────────────────────────────────────
  A318:'Airbus A318',
  A319:'Airbus A319',   A19N:'Airbus A319neo',
  A320:'Airbus A320',   A20N:'Airbus A320neo',
  A321:'Airbus A321',   A21N:'Airbus A321neo',

  // ── Airbus widebody ───────────────────────────────────────────────────────
  A306:'Airbus A300',   A310:'Airbus A310',
  A332:'Airbus A330-200', A333:'Airbus A330-300',
  A338:'Airbus A330-800neo', A339:'Airbus A330-900neo',
  A342:'Airbus A340-200', A343:'Airbus A340-300',
  A345:'Airbus A340-500', A346:'Airbus A340-600',
  A359:'Airbus A350-900', A35K:'Airbus A350-1000',
  A388:'Airbus A380 Super Jumbo', A380:'Airbus A380 Super Jumbo',

  // ── Boeing 737 Classic & NG ───────────────────────────────────────────────
  B732:'Boeing 737-200', B733:'Boeing 737-300',
  B734:'Boeing 737-400', B735:'Boeing 737-500',
  B736:'Boeing 737-600', B737:'Boeing 737-700',
  B738:'Boeing 737-800', B739:'Boeing 737-900',

  // ── Boeing 737 MAX ────────────────────────────────────────────────────────
  B37M:'Boeing 737 MAX 7',  B38M:'Boeing 737 MAX 8',
  B39M:'Boeing 737 MAX 9',  B3XM:'Boeing 737 MAX 10',

  // ── Boeing 717 / MD family ────────────────────────────────────────────────
  B712:'Boeing 717',
  MD82:'McDonnell Douglas MD-82', MD83:'McDonnell Douglas MD-83',
  MD88:'McDonnell Douglas MD-88', MD90:'McDonnell Douglas MD-90',
  MD11:'McDonnell Douglas MD-11',

  // ── Boeing 747 ────────────────────────────────────────────────────────────
  B741:'Boeing 747-100', B742:'Boeing 747-200',
  B743:'Boeing 747-300', B744:'Boeing 747-400 Jumbo Jet',
  B748:'Boeing 747-8',

  // ── Boeing 757 ────────────────────────────────────────────────────────────
  B752:'Boeing 757-200', B753:'Boeing 757-300',

  // ── Boeing 767 ────────────────────────────────────────────────────────────
  B762:'Boeing 767-200', B763:'Boeing 767-300', B764:'Boeing 767-400',

  // ── Boeing 777 ────────────────────────────────────────────────────────────
  B772:'Boeing 777-200', B77L:'Boeing 777-200LR',
  B773:'Boeing 777-300', B77W:'Boeing 777-300ER',
  B778:'Boeing 777X-8', B779:'Boeing 777X-9',

  // ── Boeing 787 Dreamliner ─────────────────────────────────────────────────
  B788:'Boeing 787-8 Dreamliner', B789:'Boeing 787-9 Dreamliner',
  B78X:'Boeing 787-10 Dreamliner',

  // ── Bombardier CRJ ────────────────────────────────────────────────────────
  CRJ1:'Bombardier CRJ-100', CRJ2:'Bombardier CRJ-200',
  CRJ7:'Bombardier CRJ-700', CRJ9:'Bombardier CRJ-900',
  CRJX:'Bombardier CRJ-1000',

  // ── Embraer ERJ / E-Jet / E-Jet E2 ───────────────────────────────────────
  E135:'Embraer ERJ-135', E145:'Embraer ERJ-145',
  E170:'Embraer E170',
  E175:'Embraer E175',  E75L:'Embraer E175-E2',
  E190:'Embraer E190',  E290:'Embraer E190-E2',
  E195:'Embraer E195',  E295:'Embraer E195-E2',

  // ── Turboprop regional ────────────────────────────────────────────────────
  AT43:'ATR 42', AT45:'ATR 42-500',
  AT72:'ATR 72', AT75:'ATR 72-500', AT76:'ATR 72-600',
  DH8A:'Dash 8-100', DH8B:'Dash 8-200',
  DH8C:'Dash 8-300', DH8D:'Dash 8-400',
  DHC6:'Twin Otter',

  // ── Piston & turboprop GA ─────────────────────────────────────────────────
  C172:'Cessna Skyhawk',  C182:'Cessna Skylane',
  C208:'Cessna Caravan',  C210:'Cessna Centurion',
  PA28:'Piper Cherokee',  PA32:'Piper Cherokee Six',
  PA46:'Piper Malibu',
  BE36:'Beechcraft Bonanza', BE58:'Beechcraft Baron',
  BE20:'Beechcraft King Air 200', BE9L:'Beechcraft King Air 90',
  SR20:'Cirrus SR20', SR22:'Cirrus SR22',
  TBM8:'Daher TBM 850', TBM9:'Daher TBM 930',
  PC12:'Pilatus PC-12',

  // ── Business jets ─────────────────────────────────────────────────────────
  PC24:'Pilatus PC-24',
  C510:'Cessna Citation Mustang',
  C525:'Cessna CitationJet',
  C25A:'Cessna Citation CJ2', C25B:'Cessna Citation CJ3', C25C:'Cessna Citation CJ4',
  C550:'Cessna Citation Bravo', C560:'Cessna Citation Ultra',
  C56X:'Cessna Citation XLS',  C650:'Cessna Citation III',
  C680:'Cessna Citation Sovereign', C68A:'Cessna Citation Latitude',
  C700:'Cessna Citation Longitude', C750:'Cessna Citation X',
  E50P:'Embraer Phenom 100', E55P:'Embraer Phenom 300',
  LJ35:'Learjet 35', LJ45:'Learjet 45', LJ60:'Learjet 60',
  GLF4:'Gulfstream G-IV',  GLF5:'Gulfstream G-V',
  G550:'Gulfstream G550',  GLF6:'Gulfstream G650',
  G500:'Gulfstream G500',  G600:'Gulfstream G600', G700:'Gulfstream G700',
  GLEX:'Bombardier Global Express', GL7T:'Bombardier Global 7500',
  F2TH:'Dassault Falcon 2000', FA50:'Dassault Falcon 50',
  F900:'Dassault Falcon 900',  FA7X:'Dassault Falcon 7X',
  FA8X:'Dassault Falcon 8X',
  HDJT:'HondaJet',

  // ── Helicopters ───────────────────────────────────────────────────────────
  B06:'Bell 206 Helicopter',  B407:'Bell 407 Helicopter',
  B429:'Bell 429 Helicopter',
  EC35:'Airbus H135 Helicopter', EC45:'Airbus H145 Helicopter',
  AS50:'Airbus AS350 Helicopter', AS32:'Airbus AS332 Helicopter',
  S76:'Sikorsky S-76 Helicopter', S92:'Sikorsky S-92 Helicopter',
  H60:'Sikorsky Black Hawk',
  R44:'Robinson R44 Helicopter', R66:'Robinson R66 Helicopter',

  // ── Military ──────────────────────────────────────────────────────────────
  C17:'Boeing C-17 Globemaster',   C130:'Lockheed C-130 Hercules',
  C5:'Lockheed C-5 Galaxy',        B52:'Boeing B-52 Stratofortress',
  KC135:'Boeing KC-135 Stratotanker', KC46:'Boeing KC-46 Pegasus',
  E3:'Boeing E-3 Sentry',          P8:'Boeing P-8 Poseidon',
  F16:'F-16 Fighting Falcon',      F18:'F/A-18 Hornet',
  F22:'F-22 Raptor',               F35:'F-35 Lightning II',

  // ── Special ───────────────────────────────────────────────────────────────
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
