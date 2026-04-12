const AEROAPI_BASE = 'https://aeroapi.flightaware.com/aeroapi';
const SEARCH_RADIUS_NM = 10;

/**
 * Search for flights within SEARCH_RADIUS_NM nautical miles of lat/lon.
 * Uses AeroAPI FLIFO query: -latlong "lat lon" -radius NM
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object[]>} Raw FlightAware flight objects
 */
async function getNearbyFlights(lat, lon) {
  const query = `-latlong "${lat} ${lon}" -radius ${SEARCH_RADIUS_NM}`;
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
