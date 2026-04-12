# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PlanesNearbyPodcast — Node.js/Express web app that geolocates visitors via IPGeolocation.io, finds nearby aircraft via FlightAware AeroAPI, and renders a kid-friendly themed page with a Leaflet map.

## Commands

    npm start                                       # production server
    npm run dev                                     # dev server with auto-reload (nodemon)
    npm test                                        # run all Jest tests
    npm test -- --testPathPattern=cache             # run one test file by name

## Architecture

- `src/server.js` — Express app, routes, IP detection, cache wiring
- `src/cache.js` — In-memory TTL Map (5 min default), keyed by IP; `get`, `set`, `getMetadata`, `sweep`, `clear`
- `src/services/geolocation.js` — IPGeolocation.io API; returns `{lat, lon, city, state, theme}`
- `src/services/flightaware.js` — FlightAware AeroAPI `/flights/search` with `-latlong` FLIFO query
- `src/services/aircraft.js` — Haversine distance, interesting tagging (emergency/military/medical), sort, dedup
- `src/services/scriptGenerator.js` — Aircraft object to kid-friendly English string
- `src/views/page.js` — Full SSR HTML string with embedded JSON for client hydration

## Key Behaviours

- `GET /` serves SSR HTML; `GET /api/aircraft` returns the same data as JSON (used by refresh + future TTS)
- `?ip=8.8.8.8` query param overrides IP detection — required for localhost testing
- `last_position.altitude` from FlightAware is in hundreds of feet (280 = 28,000 ft)
- Aircraft data embedded in page as `<script id="pnp-data" type="application/json">` — parsed client-side
- Theme (`day`/`night`) calculated server-side via `suncalc` using user lat/lon
- Client-side DOM updates use `createElement`/`textContent` throughout

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `IPGEO_API_KEY` | Yes | IPGeolocation.io dashboard |
| `FLIGHTAWARE_API_KEY` | Yes | FlightAware AeroAPI dashboard |
| `PORT` | No | Injected by Railway automatically |

## Deployment

Railway via GitHub integration — push to `main` auto-deploys. PR previews are enabled; `.github/workflows/preview-comment.yml` posts the preview URL as a PR comment (requires `RAILWAY_TOKEN` and `RAILWAY_PROJECT_ID` GitHub secrets).
