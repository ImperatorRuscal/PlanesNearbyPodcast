const SunCalc = require('suncalc');

/**
 * @param {string} ip
 * @param {Date} [now]
 * @returns {Promise<{lat: number, lon: number, city: string, state: string, theme: 'day'|'night'}>}
 */
async function getGeolocation(ip, now = new Date()) {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEO_API_KEY}&ip=${ip}&fields=geo`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPGeolocation API error: ${res.status}`);

  const data = await res.json();
  const lat = parseFloat(data.latitude);
  const lon = parseFloat(data.longitude);
  if (isNaN(lat) || isNaN(lon)) throw new Error('Could not determine location for this IP address');

  const times = SunCalc.getTimes(now, lat, lon);
  const theme = now >= times.sunrise && now < times.sunset ? 'day' : 'night';

  return { lat, lon, city: data.city || 'Unknown City', state: data.state_prov || '', theme };
}

module.exports = { getGeolocation };
