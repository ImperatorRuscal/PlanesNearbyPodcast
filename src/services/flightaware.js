const AEROAPI_BASE = 'https://aeroapi.flightaware.com/aeroapi';
const SEARCH_RADIUS_NM = 15;

/**
 * Convert nautical miles to degrees of latitude.
 * 1 degree latitude ≈ 60 nautical miles.
 */
function nmToLatDeg(nm) {
  return nm / 60;
}

/**
 * Convert nautical miles to degrees of longitude at a given latitude.
 * Longitude degrees shrink toward the poles.
 */
function nmToLonDeg(nm, lat) {
  return nm / (60 * Math.cos(lat * Math.PI / 180));
}

/**
 * Search for flights within SEARCH_RADIUS_NM nautical miles of lat/lon.
 * AeroAPI -latlong expects a bounding box: "MINLAT MINLON MAXLAT MAXLON"
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object[]>} Raw FlightAware flight objects
 */
async function getNearbyFlights(lat, lon) {
  const dLat = nmToLatDeg(SEARCH_RADIUS_NM);
  const dLon = nmToLonDeg(SEARCH_RADIUS_NM, lat);

  const minLat = (lat - dLat).toFixed(6);
  const maxLat = (lat + dLat).toFixed(6);
  const minLon = (lon - dLon).toFixed(6);
  const maxLon = (lon + dLon).toFixed(6);

  const query = `-latlong "${minLat} ${minLon} ${maxLat} ${maxLon}"`;
  const url = `${AEROAPI_BASE}/flights/search?query=${encodeURIComponent(query)}&max_pages=1`;

  const res = await fetch(url, {
    headers: {
      'x-apikey': process.env.FLIGHTAWARE_API_KEY || '',
      'Accept': 'application/json; charset=UTF-8',
    },
  });

  if (!res.ok) throw new Error(`FlightAware API error: ${res.status}`);
  const data = await res.json();
  return data.flights ?? [];
}

module.exports = { getNearbyFlights };
