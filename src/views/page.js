/** Escape special HTML characters to prevent injection in server-rendered output. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function badgeHtml(aircraft, index) {
  const r = aircraft.interestingReason;
  if (r === 'emergency_7700') return '<span class="badge badge-emergency">&#x1F6A8; EMERGENCY</span>';
  if (r === 'emergency_7500') return '<span class="badge badge-emergency">&#x1F6A8; HIJACK ALERT</span>';
  if (r === 'emergency_7600') return '<span class="badge badge-emergency">&#x1F6A8; RADIO LOST</span>';
  if (r === 'military')       return '<span class="badge badge-military">&#x1F1FA;&#x1F1F8; MILITARY</span>';
  if (r === 'medical')        return '<span class="badge badge-medical">&#x1F3E5; MEDICAL</span>';
  return `<span class="badge badge-rank">#${index + 1} Closest</span>`;
}

/** Render a single aircraft card as an HTML string (server-side). */
function renderCard(aircraft, index) {
  const a = aircraft;
  const r = a.interestingReason;
  const cardClass = ['card',
    r && r.startsWith('emergency') ? 'emergency' : '',
    r === 'military' ? 'military' : '',
    r === 'medical'  ? 'medical'  : '',
  ].filter(Boolean).join(' ');

  const lat = a.last_position?.latitude ?? '';
  const lon = a.last_position?.longitude ?? '';

  const metaParts = [
    esc(a.friendlyType),
    a.distanceNm ? esc(a.distanceNm + ' nm away') : null,
    a.last_position?.altitude ? esc((a.last_position.altitude * 100).toLocaleString() + ' ft') : null,
    a.origin && a.destination
      ? esc((a.origin.city || a.origin.code) + ' \u2192 ' + (a.destination.city || a.destination.code))
      : null,
  ].filter(Boolean).join(' &middot; ');

  // FA URL is constructed by us and always starts with https://www.flightaware.com/
  const safeUrl = (a.flightawareUrl || '').startsWith('https://') ? esc(a.flightawareUrl) : '#';

  return `<div class="${esc(cardClass)}" data-ident="${esc(a.ident)}" data-lat="${esc(String(lat))}" data-lon="${esc(String(lon))}" onclick="toggleCard(this)">
  <div class="card-header">
    <div class="card-title">
      ${a.isHelicopter ? '&#x1F681;' : '&#x2708;&#xFE0F;'} ${esc(a.ident)}
      <a class="fa-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="View on FlightAware">
        <img src="/fa-logo.png" alt="FlightAware" onerror="this.style.display='none'">
      </a>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      ${badgeHtml(a, index)}
      <span class="card-chevron">&#x25BC;</span>
    </div>
  </div>
  <div class="card-body">
    <div class="card-meta">${metaParts}</div>
    <div class="card-script">${esc(a.script || '')}</div>
  </div>
</div>`;
}

/**
 * Render the full SSR HTML page.
 * @param {{location, theme, aircraft, cachedAt, expiresAt}} data
 * @returns {string}
 */
function renderPage(data) {
  const { location, theme, aircraft, expiresAt } = data;
  const locationLabel = esc([location.city, location.state].filter(Boolean).join(', '));

  // Aircraft JSON embedded for client-side use.
  // Only lat/lon/ident/distanceNm/script/flightawareUrl/interestingReason are needed client-side.
  const clientAircraft = aircraft.map(a => ({
    ident: a.ident,
    friendlyType: a.friendlyType,
    distanceNm: a.distanceNm,
    interesting: a.interesting,
    interestingReason: a.interestingReason,
    isHelicopter: a.isHelicopter || false,
    flightawareUrl: a.flightawareUrl,
    script: a.script,
    origin: a.origin ? { code: a.origin.code, city: a.origin.city } : null,
    destination: a.destination ? { code: a.destination.code, city: a.destination.city } : null,
    last_position: a.last_position
      ? { latitude: a.last_position.latitude, longitude: a.last_position.longitude, altitude: a.last_position.altitude, heading: a.last_position.heading }
      : null,
  }));

  const embeddedJson = JSON.stringify({ aircraft: clientAircraft, location, expiresAt });

  const cardsHtml = aircraft.length === 0
    ? '<div class="empty-state"><div class="emoji">&#x1F324;&#xFE0F;</div><p>The skies above you are quiet right now &#x2014; check back soon!</p></div>'
    : aircraft.map((a, i) => renderCard(a, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planes Near ${locationLabel || 'You'}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""><\/script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;min-height:100vh;transition:background .3s}

    /* Day theme */
    body.theme-day{background:linear-gradient(180deg,#87CEEB 0%,#B0E2FF 60%,#e8f8e8 100%);color:#1a1a2e}
    body.theme-day .card{background:rgba(255,255,255,.92)}
    body.theme-day header{background:rgba(255,255,255,.6);backdrop-filter:blur(8px)}

    /* Night theme */
    body.theme-night{background:linear-gradient(180deg,#0a0a2e 0%,#1a1a4e 60%,#0d2137 100%);color:#e0e8ff}
    body.theme-night .card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#e0e8ff}
    body.theme-night header{background:rgba(0,0,30,.6);backdrop-filter:blur(8px)}
    body.theme-night .card-meta{color:#aac}
    body.theme-night .card-script{color:#ccd}
    body.theme-night::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(1px 1px at 10% 15%,white 0%,transparent 100%),
        radial-gradient(1px 1px at 30% 8%,white 0%,transparent 100%),
        radial-gradient(1px 1px at 55% 20%,white 0%,transparent 100%),
        radial-gradient(2px 2px at 75% 5%,rgba(255,255,200,.7) 0%,transparent 100%),
        radial-gradient(1px 1px at 90% 18%,white 0%,transparent 100%);opacity:.5}

    /* Basic theme */
    body.theme-basic{background:#f5f7fa;color:#1a1a1a}
    body.theme-basic .card{background:#fff;border:1px solid #e0e4ea}
    body.theme-basic header{background:#2563eb;color:#fff}
    body.theme-basic header h1,body.theme-basic header p{color:#fff}
    body.theme-basic .theme-toggle{background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.4)}

    /* Layout */
    header{position:sticky;top:0;z-index:100;padding:12px 20px;display:flex;align-items:center;
      justify-content:space-between;flex-wrap:wrap;gap:8px;border-bottom:1px solid rgba(0,0,0,.08)}
    .header-left h1{font-size:1.2rem;font-weight:700}
    .header-left p{font-size:.8rem;opacity:.75;margin-top:2px}
    .header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

    .theme-toggle,.reload-btn{font-size:.75rem;padding:5px 12px;border-radius:20px;cursor:pointer;
      border:1px solid currentColor;background:transparent;color:inherit}
    .reload-btn:disabled{opacity:.45;cursor:not-allowed}

    .main-layout{position:relative;z-index:1;display:grid;grid-template-columns:380px 1fr;height:calc(100vh - 60px)}
    @media(max-width:767px){
      .main-layout{grid-template-columns:1fr;grid-template-rows:300px 1fr;height:auto}
      .map-pane{order:-1}
      .cards-pane{height:auto;overflow:visible}
    }
    .cards-pane{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
    .map-pane{position:relative}
    #map{width:100%;height:100%;min-height:300px}

    /* Cards */
    .card{border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden;cursor:pointer;
      transition:transform .15s,box-shadow .15s}
    .card:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15)}
    .card.emergency{border-left:4px solid #dc2626}
    .card.military{border-left:4px solid #1d4ed8}
    .card.medical{border-left:4px solid #16a34a}
    .card-header{padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px}
    .card-title{font-weight:700;font-size:.95rem;display:flex;align-items:center;gap:6px}
    .fa-link{display:inline-flex;align-items:center;opacity:.75}
    .fa-link:hover{opacity:1}
    .fa-link img{width:14px;height:14px;vertical-align:middle}
    .badge{font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:10px;white-space:nowrap}
    .badge-emergency{background:#dc2626;color:#fff}
    .badge-military{background:#1d4ed8;color:#fff}
    .badge-medical{background:#16a34a;color:#fff}
    .badge-rank{background:rgba(0,0,0,.12);color:inherit}
    .card-chevron{font-size:.75rem;transition:transform .2s;flex-shrink:0}
    .card.open .card-chevron{transform:rotate(180deg)}
    .card-body{display:none;padding:0 14px 12px}
    .card.open .card-body{display:block}
    .card-meta{font-size:.8rem;opacity:.75;margin-bottom:6px;line-height:1.5}
    .card-script{font-size:.85rem;line-height:1.6;border-top:1px solid rgba(0,0,0,.08);
      padding-top:8px;margin-top:8px;font-style:italic}
    .empty-state{text-align:center;padding:40px 20px;opacity:.7}
    .empty-state .emoji{font-size:3rem;margin-bottom:12px}
  </style>
</head>
<body class="theme-${esc(theme)}">
<header>
  <div class="header-left">
    <h1>&#x2708;&#xFE0F; Planes Near ${locationLabel || 'You'}</h1>
    <p id="update-time">Updated just now</p>
  </div>
  <div class="header-right">
    <button class="theme-toggle" onclick="toggleTheme()" id="theme-btn">Switch to Basic View</button>
    <button class="reload-btn" id="reload-btn" onclick="reloadData()" disabled>Reload &#x2014; loading&hellip;</button>
  </div>
</header>

<div class="main-layout">
  <div class="cards-pane" id="cards-pane">
    ${cardsHtml}
  </div>
  <div class="map-pane"><div id="map"></div></div>
</div>

<script id="pnp-data" type="application/json">${embeddedJson}<\/script>
<script>
(function () {
  // ── Constants & refs ─────────────────────────────────────────────────────
  const BASIC_KEY = 'pnp-basic-theme';
  const SERVER_THEME = ${JSON.stringify(theme)};
  const themeBtn = document.getElementById('theme-btn');
  const reloadBtn = document.getElementById('reload-btn');
  let expiresAt = ${JSON.stringify(expiresAt)};

  // ── Apply stored theme before first paint ─────────────────────────────────
  if (localStorage.getItem(BASIC_KEY) === '1') {
    document.body.classList.remove('theme-day', 'theme-night');
    document.body.classList.add('theme-basic');
    themeBtn.textContent = 'Switch to Themed View';
  }

  // ── Theme toggle ──────────────────────────────────────────────────────────
  window.toggleTheme = function () {
    const isBasic = document.body.classList.contains('theme-basic');
    if (isBasic) {
      document.body.classList.remove('theme-basic');
      document.body.classList.add('theme-' + SERVER_THEME);
      localStorage.setItem(BASIC_KEY, '0');
      themeBtn.textContent = 'Switch to Basic View';
    } else {
      document.body.classList.remove('theme-day', 'theme-night');
      document.body.classList.add('theme-basic');
      localStorage.setItem(BASIC_KEY, '1');
      themeBtn.textContent = 'Switch to Themed View';
    }
  };

  // ── Countdown timer ───────────────────────────────────────────────────────
  function updateCountdown() {
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      reloadBtn.disabled = false;
      reloadBtn.textContent = 'Reload Now \u21BA';
    } else {
      const s = Math.ceil(msLeft / 1000);
      const m = Math.floor(s / 60);
      reloadBtn.textContent = 'Reload \u2014 available in ' + m + ':' + String(s % 60).padStart(2, '0');
      setTimeout(updateCountdown, 1000);
    }
  }
  updateCountdown();

  // ── Reload handler ────────────────────────────────────────────────────────
  window.reloadData = async function () {
    if (reloadBtn.disabled) return;
    reloadBtn.disabled = true;
    reloadBtn.textContent = 'Loading\u2026';
    try {
      const res = await fetch('/api/aircraft');
      if (!res.ok) throw new Error('API error ' + res.status);
      const data = await res.json();
      expiresAt = data.expiresAt;
      rebuildCards(data.aircraft);
      rebuildMarkers(data.aircraft);
      fitAllAircraft();
      document.getElementById('update-time').textContent = 'Updated just now';
      updateCountdown();
    } catch (_e) {
      reloadBtn.disabled = false;
      reloadBtn.textContent = 'Retry \u21BA';
    }
  };

  // ── Card expand/collapse ──────────────────────────────────────────────────
  window.toggleCard = function (el) {
    const opening = !el.classList.contains('open');
    // Close all other open cards first
    document.querySelectorAll('.card.open').forEach(function (c) { if (c !== el) c.classList.remove('open'); });
    el.classList.toggle('open');
    if (opening && el.classList.contains('open')) {
      const lat = parseFloat(el.dataset.lat);
      const lon = parseFloat(el.dataset.lon);
      if (!isNaN(lat) && !isNaN(lon) && window._map) {
        window._map.setView([lat, lon], 13);
        const marker = window._markers && window._markers[el.dataset.ident];
        if (marker) marker.openPopup();
      }
    } else if (!document.querySelector('.card.open')) {
      fitAllAircraft();
    }
  };

  // ── Leaflet map ───────────────────────────────────────────────────────────
  const rawData = JSON.parse(document.getElementById('pnp-data').textContent);
  const loc = rawData.location;
  let _currentAircraft = rawData.aircraft || [];

  const map = L.map('map');
  window._map = map;
  window._markers = {};

  function fitAllAircraft() {
    var points = [[loc.lat, loc.lon]];
    _currentAircraft.forEach(function (a) {
      if (a.last_position && a.last_position.latitude != null && a.last_position.longitude != null) {
        points.push([a.last_position.latitude, a.last_position.longitude]);
      }
    });
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    } else {
      map.setView([loc.lat, loc.lon], 11);
    }
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  L.circleMarker([loc.lat, loc.lon], {
    radius: 8, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9,
  }).bindPopup('\uD83D\uDCCD Your location').addTo(map);

  window._aircraftLayer = L.layerGroup().addTo(map);

  function planeIcon(a) {
    const r = a.interestingReason;
    const color = r && r.startsWith('emergency') ? '#dc2626'
                : r === 'medical'               ? '#16a34a'
                : '#1d4ed8';
    // heading 0 = north; SVG body points up so no offset needed.
    const heading = (a.last_position && a.last_position.heading != null)
      ? Number(a.last_position.heading) : 0;
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="45" height="45">' +
        // fuselage
        '<polygon points="16,2 19.5,26 16,21 12.5,26" fill="' + color + '" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>' +
        // wings
        '<polygon points="1,16 16,11 31,16 16,18" fill="' + color + '" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>' +
        // tail fins
        '<polygon points="10,24 16,21 22,24 16,26" fill="' + color + '" stroke="white" stroke-width="1" stroke-linejoin="round"/>' +
      '</svg>';
    return L.divIcon({
      className: '',
      html: '<div style="width:45px;height:45px;transform:rotate(' + heading + 'deg);filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))">' + svg + '</div>',
      iconSize: [45, 45],
      iconAnchor: [22, 22],
    });
  }

  function rebuildMarkers(aircraft) {
    _currentAircraft = aircraft || [];
    window._aircraftLayer.clearLayers();
    window._markers = {};
    _currentAircraft.forEach(function (a) {
      if (!a.last_position) return;
      const lat = a.last_position.latitude;
      const lon = a.last_position.longitude;
      const rawLabel = a.ident + ' \u2022 ' + a.friendlyType + ' \u2022 ' + a.distanceNm + ' nm';
      const label = rawLabel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const marker = L.marker([lat, lon], { icon: planeIcon(a) }).bindPopup(label);
      marker.on('click', function () {
        // Small delay lets Leaflet finish its own click handling before we scroll.
        setTimeout(function () {
          const card = document.querySelector('.card[data-ident="' + a.ident + '"]');
          if (!card) return;
          document.querySelectorAll('.card.open').forEach(function (c) { c.classList.remove('open'); });
          card.classList.add('open');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          map.setView([lat, lon], 13);
        }, 50);
      });
      marker.addTo(window._aircraftLayer);
      window._markers[a.ident] = marker;
    });
  }

  // ── Card DOM builder (no string-to-DOM injection) ─────────────────────────
  function makeBadge(a, index) {
    const span = document.createElement('span');
    span.className = 'badge';
    const r = a.interestingReason;
    if (r === 'emergency_7700') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 EMERGENCY'; }
    else if (r === 'emergency_7500') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 HIJACK ALERT'; }
    else if (r === 'emergency_7600') { span.className += ' badge-emergency'; span.textContent = '\uD83D\uDEA8 RADIO LOST'; }
    else if (r === 'military')       { span.className += ' badge-military'; span.textContent = '\uD83C\uDDFA\uD83C\uDDF8 MILITARY'; }
    else if (r === 'medical')        { span.className += ' badge-medical'; span.textContent = '\uD83C\uDFE5 MEDICAL'; }
    else { span.className += ' badge-rank'; span.textContent = '#' + (index + 1) + ' Closest'; }
    return span;
  }

  function makeCardElement(a, index) {
    const r = a.interestingReason;
    const classes = ['card',
      r && r.startsWith('emergency') ? 'emergency' : '',
      r === 'military' ? 'military' : '',
      r === 'medical'  ? 'medical'  : '',
    ].filter(Boolean).join(' ');

    const card = document.createElement('div');
    card.className = classes;
    card.dataset.ident = a.ident || '';
    card.dataset.lat = String(a.last_position?.latitude ?? '');
    card.dataset.lon = String(a.last_position?.longitude ?? '');
    card.addEventListener('click', function () { window.toggleCard(this); });

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'card-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';
    titleDiv.appendChild(document.createTextNode((a.isHelicopter ? '\uD83D\uDE81' : '\u2708\uFE0F') + ' ' + (a.ident || 'Unknown')));

    // FA link — href is always https://www.flightaware.com/... constructed by server
    if (a.flightawareUrl && a.flightawareUrl.startsWith('https://')) {
      const link = document.createElement('a');
      link.className = 'fa-link';
      link.href = a.flightawareUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'View on FlightAware';
      link.addEventListener('click', function (e) { e.stopPropagation(); });
      const img = document.createElement('img');
      img.src = '/fa-logo.png';
      img.alt = 'FlightAware';
      img.addEventListener('error', function () { this.style.display = 'none'; });
      link.appendChild(img);
      titleDiv.appendChild(link);
    }

    const badgeGroup = document.createElement('div');
    badgeGroup.style.cssText = 'display:flex;align-items:center;gap:6px';
    const chevron = document.createElement('span');
    chevron.className = 'card-chevron';
    chevron.textContent = '\u25BC';
    badgeGroup.append(makeBadge(a, index), chevron);
    hdr.append(titleDiv, badgeGroup);

    // Body
    const body = document.createElement('div');
    body.className = 'card-body';

    const metaParts = [
      a.friendlyType,
      a.distanceNm ? a.distanceNm + ' nm away' : null,
      a.last_position?.altitude ? (a.last_position.altitude * 100).toLocaleString() + ' ft' : null,
      a.origin && a.destination
        ? (a.origin.city || a.origin.code) + ' \u2192 ' + (a.destination.city || a.destination.code)
        : null,
    ].filter(Boolean);

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = metaParts.join(' \u00b7 ');

    const scriptEl = document.createElement('div');
    scriptEl.className = 'card-script';
    scriptEl.textContent = a.script || '';

    body.append(meta, scriptEl);
    card.append(hdr, body);
    return card;
  }

  function rebuildCards(aircraft) {
    const pane = document.getElementById('cards-pane');
    pane.replaceChildren();
    if (!aircraft || aircraft.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const emoji = document.createElement('div');
      emoji.className = 'emoji';
      emoji.textContent = '\u{1F324}\uFE0F';
      const msg = document.createElement('p');
      msg.textContent = 'The skies above you are quiet right now \u2014 check back soon!';
      empty.append(emoji, msg);
      pane.appendChild(empty);
      return;
    }
    aircraft.forEach(function (a, i) { pane.appendChild(makeCardElement(a, i)); });
    const first = pane.querySelector('.card');
    if (first) first.classList.add('open');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  rebuildMarkers(rawData.aircraft);
  fitAllAircraft();
  const firstCard = document.querySelector('.card');
  if (firstCard) firstCard.classList.add('open');
})();
<\/script>
</body>
</html>`;
}

module.exports = { renderPage, renderCard };
