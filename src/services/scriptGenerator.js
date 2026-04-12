const EMERGENCY_PHRASES = {
  emergency_7700: 'This airplane is broadcasting a general emergency signal!',
  emergency_7500: 'This airplane has reported a hijacking emergency!',
  emergency_7600: 'This airplane has lost radio contact with air traffic control!',
};

// ICAO 3-letter airline prefix → full airline name
const AIRLINE_CALLSIGNS = {
  // US majors
  AAL: 'American Airlines',
  DAL: 'Delta Air Lines',
  UAL: 'United Airlines',
  SWA: 'Southwest Airlines',
  ASA: 'Alaska Airlines',
  JBU: 'JetBlue Airways',
  NKS: 'Spirit Airlines',
  FFT: 'Frontier Airlines',
  HAL: 'Hawaiian Airlines',
  SKW: 'SkyWest Airlines',
  RPA: 'Republic Airways',
  EJA: 'NetJets',
  // Cargo
  FDX: 'FedEx',
  UPS: 'UPS',
  GTI: 'Atlas Air',
  ABX: 'ABX Air',
  // International
  BAW: 'British Airways',
  DLH: 'Lufthansa',
  AFR: 'Air France',
  KLM: 'KLM',
  UAE: 'Emirates',
  QTR: 'Qatar Airways',
  ACA: 'Air Canada',
  WJA: 'WestJet',
  QFA: 'Qantas',
  SIA: 'Singapore Airlines',
  CPA: 'Cathay Pacific',
  JAL: 'Japan Airlines',
  ANA: 'ANA',
  KAL: 'Korean Air',
  AAR: 'Asiana Airlines',
  IBE: 'Iberia',
  TAP: 'TAP Air Portugal',
  VIR: 'Virgin Atlantic',
  EZY: 'easyJet',
  RYR: 'Ryanair',
  TUI: 'TUI Airways',
};

/**
 * Expand an ICAO callsign like "AAL717" → "American Airlines 717".
 * Returns the original ident unchanged if no match is found.
 */
function expandCallsign(ident) {
  if (!ident) return 'unknown';
  const m = ident.match(/^([A-Z]{3})(\d+.*)$/);
  if (m && AIRLINE_CALLSIGNS[m[1]]) return `${AIRLINE_CALLSIGNS[m[1]]} ${m[2]}`;
  return ident;
}

/**
 * Format distance from nautical miles into the appropriate unit:
 *   US visitors → miles  (1 nm ≈ 1.15078 mi)
 *   Everyone else → km  (1 nm = 1.852 km)
 *   Unknown country → nautical miles (fallback)
 */
function formatDistance(nm, countryCode) {
  if (countryCode === 'US') {
    const miles = Math.round(nm * 1.15078 * 10) / 10;
    if (miles < 1) return 'less than one mile';
    return `about ${miles} mile${miles === 1 ? '' : 's'}`;
  }
  if (countryCode) {
    const km = Math.round(nm * 1.852 * 10) / 10;
    if (km < 1) return 'less than one kilometer';
    return `about ${km} kilometer${km === 1 ? '' : 's'}`;
  }
  // Fallback
  if (nm < 1) return 'less than one nautical mile';
  return `about ${nm} nautical mile${nm === 1 ? '' : 's'}`;
}

function formatAltitude(altHundreds) {
  if (!altHundreds) return null;
  const feet = altHundreds * 100;
  const formatted = feet.toLocaleString('en-US');
  if (feet >= 35000) return `${formatted} feet — that's above most clouds!`;
  if (feet >= 18000) return `${formatted} feet — way up in the sky!`;
  if (feet >= 5000)  return `${formatted} feet — high above the rooftops!`;
  return `${formatted} feet — still climbing or getting ready to land!`;
}

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Generates a kid-friendly script string for an enriched aircraft object.
 * @param {object} aircraft - output of processFlights() with distanceNm, friendlyType, interesting, interestingReason
 * @param {string} [countryCode] - ISO 3166-1 alpha-2 country code of the viewer (e.g. 'US')
 * @returns {string}
 */
function generateScript(aircraft, countryCode) {
  const parts = [];
  const type = aircraft.friendlyType || 'airplane';
  const dist = formatDistance(aircraft.distanceNm, countryCode);

  if (aircraft.interesting && aircraft.interestingReason) {
    if (aircraft.interestingReason === 'military') {
      parts.push('Heads up — there is a military airplane nearby!');
    } else if (aircraft.interestingReason === 'medical') {
      parts.push('There is a medical airplane nearby helping someone!');
    } else if (EMERGENCY_PHRASES[aircraft.interestingReason]) {
      parts.push(`Emergency! ${EMERGENCY_PHRASES[aircraft.interestingReason]}`);
    }
  }

  const rawIdent = aircraft.ident || aircraft.registration;
  const expanded = expandCallsign(rawIdent);
  const identDesc = expanded !== rawIdent
    ? `on ${expanded}`                      // e.g. "on American Airlines 717"
    : `with the callsign ${expanded}`;      // e.g. "with the callsign N12345"

  const distCap = dist.charAt(0).toUpperCase() + dist.slice(1);
  parts.push(`${distCap} away from you, there is a ${type} ${identDesc}.`);

  if (aircraft.origin?.city && aircraft.destination?.city) {
    const arr = formatTime(aircraft.estimated_on || aircraft.scheduled_on);
    let route = `This ${type} is flying from ${aircraft.origin.city} to ${aircraft.destination.city}`;
    if (arr) route += ` and is expected to arrive around ${arr}`;
    parts.push(route + '.');
  }

  const altDesc = formatAltitude(aircraft.last_position?.altitude);
  if (altDesc) parts.push(`Right now it is flying at ${altDesc}.`);

  return parts.join(' ');
}

module.exports = { generateScript, expandCallsign, formatDistance };
