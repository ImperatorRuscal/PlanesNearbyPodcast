const EMERGENCY_PHRASES = {
  emergency_7700: 'This airplane is broadcasting a general emergency signal!',
  emergency_7500: 'This airplane has reported a hijacking emergency!',
  emergency_7600: 'This airplane has lost radio contact with air traffic control!',
};

function formatAltitude(altHundreds) {
  if (!altHundreds) return null;
  const feet = altHundreds * 100;
  const formatted = feet.toLocaleString('en-US');
  if (feet >= 35000) return `${formatted} feet — that's above most clouds!`;
  if (feet >= 18000) return `${formatted} feet — way up in the sky!`;
  if (feet >= 5000)  return `${formatted} feet — high above the rooftops!`;
  return `${formatted} feet — still climbing or getting ready to land!`;
}

function formatDistance(nm) {
  if (nm < 1) return 'less than one nautical mile';
  return `about ${nm} nautical mile${nm === 1 ? '' : 's'}`;
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
 * @returns {string}
 */
function generateScript(aircraft) {
  const parts = [];
  const type = aircraft.friendlyType || 'airplane';
  const dist = formatDistance(aircraft.distanceNm);

  if (aircraft.interesting && aircraft.interestingReason) {
    if (aircraft.interestingReason === 'military') {
      parts.push('Heads up — there is a military airplane nearby!');
    } else if (aircraft.interestingReason === 'medical') {
      parts.push('There is a medical airplane nearby helping someone!');
    } else if (EMERGENCY_PHRASES[aircraft.interestingReason]) {
      parts.push(`Emergency! ${EMERGENCY_PHRASES[aircraft.interestingReason]}`);
    }
  }

  const distCap = dist.charAt(0).toUpperCase() + dist.slice(1);
  parts.push(`${distCap} away from you, there is a ${type} with the callsign ${aircraft.ident || aircraft.registration || 'unknown'}.`);

  if (aircraft.origin?.city && aircraft.destination?.city) {
    const dep = formatTime(aircraft.actual_off || aircraft.scheduled_off);
    const arr = formatTime(aircraft.estimated_on || aircraft.scheduled_on);
    let route = `This ${type} flew from ${aircraft.origin.city} and is heading to ${aircraft.destination.city}`;
    if (dep) route += `, departing at ${dep}`;
    if (arr) route += ` and expected to arrive at ${arr}`;
    parts.push(route + '.');
  }

  const altDesc = formatAltitude(aircraft.last_position?.altitude);
  if (altDesc) parts.push(`Right now it is flying at ${altDesc}.`);

  return parts.join(' ');
}

module.exports = { generateScript };
