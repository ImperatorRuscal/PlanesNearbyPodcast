# Planes Nearby Podcast

A kid-friendly web app that finds aircraft near your location and describes them in fun, plain language.

## What It Does

1. Detects your approximate location from your IP (IPGeolocation.io)
2. Finds aircraft within 10 nautical miles via FlightAware AeroAPI
3. Highlights the 5 closest planes plus any interesting ones (emergencies, military, medical)
4. Generates a kid-friendly description for each plane
5. Caches results per visitor per 5 minutes to keep API calls low
6. Shows a live Leaflet map with each aircraft plotted

## Prerequisites

- Node.js 20+, npm
- [Railway](https://railway.app) account (free tier works)
- [GitHub](https://github.com) account

## API Keys

### IPGeolocation.io
1. Create a free account at [ipgeolocation.io](https://ipgeolocation.io)
2. Copy your API key from the dashboard
3. Free tier: 1,000 requests/day

### FlightAware AeroAPI
1. Sign up at [flightaware.com/aeroapi](https://www.flightaware.com/aeroapi/)
2. Create an API key in Account Settings
3. **Note:** AeroAPI is a paid service. Each unique visitor triggers one search request per 5-minute window.

## Local Development

    git clone https://github.com/YOUR_USERNAME/PlanesNearbyPodcast.git
    cd PlanesNearbyPodcast
    npm install
    cp .env.example .env        # then fill in your two API keys
    npm run dev
    # Open: http://localhost:3000?ip=8.8.8.8
    # (127.0.0.1 cannot be geolocated — use ?ip= to test)

    npm test                    # run all tests
    npm test -- --testPathPattern=cache   # run one test file

## Deploy to Railway

**Step 1 — Push to GitHub**
Make sure your repo is on GitHub.

**Step 2 — Create Railway project**
- Log in to railway.app
- Click New Project > Deploy from GitHub repo
- Select PlanesNearbyPodcast

**Step 3 — Set environment variables**
In your Railway service > Variables tab, add:

| Name | Value |
|---|---|
| IPGEO_API_KEY | Your IPGeolocation.io key |
| FLIGHTAWARE_API_KEY | Your FlightAware AeroAPI key |

Railway injects PORT and NODE_ENV automatically.

**Step 4 — Enable PR preview deployments**
In Railway project Settings > find Preview Environments and toggle it ON.

**Step 5 — Add GitHub secrets for PR preview comments**

Get your Railway token: Railway dashboard > avatar (top-right) > Account Settings > Tokens > Create Token

Get your Railway project ID: Railway dashboard > your project > Settings tab > Project ID

In your GitHub repo > Settings > Secrets and variables > Actions, add:

| Secret name | Value |
|---|---|
| RAILWAY_TOKEN | Your Railway token |
| RAILWAY_PROJECT_ID | Your Railway project ID |

When you open a PR, a bot will post a comment with the preview URL once the deployment is ready.

**Step 6 — Verify**
Open the deployment URL from your Railway dashboard. You should see aircraft data for your location.

## Project Structure

    src/
      server.js              Express app and routes
      cache.js               In-memory 5-minute TTL cache
      services/
        geolocation.js       IPGeolocation.io integration
        flightaware.js       FlightAware AeroAPI integration
        aircraft.js          Filtering, sorting, Haversine distance
        scriptGenerator.js   Kid-friendly text generation
      views/
        page.js              SSR HTML page generator
    public/
      fa-logo.png            FlightAware attribution logo
    tests/                   Jest test suite

## Future: Audio / Yoto Expansion

The /api/aircraft endpoint already returns a `script` field on each aircraft.
To add audio output when ready:

1. Call GET /api/aircraft
2. Pass each aircraft.script to ElevenLabs or Google TTS
3. Stitch returned audio into an MP3
4. Add a GET /api/podcast.mp3 route

No changes to existing code are needed — the TTS route slots in alongside what is already there.
