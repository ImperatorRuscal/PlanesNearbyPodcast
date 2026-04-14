# Planes Nearby Podcast

A kid-friendly web app that finds aircraft near your location, describes them in fun, plain language, and plays them as an audio podcast you can listen to on a Yoto player.

## What It Does

1. Detects your approximate location from your IP (IPGeolocation.io)
2. Finds aircraft within 10 nautical miles via FlightAware AeroAPI
3. Highlights the 5 closest planes plus any interesting ones (emergencies, military, medical)
4. Generates a kid-friendly description for each plane
5. Caches results per visitor per 5 minutes to keep API calls low
6. Shows a live Leaflet map with each aircraft plotted
7. Streams a Yoto-compatible audio playlist: intro narration + per-aircraft TTS clips via ElevenLabs

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

### ElevenLabs
1. Create a free account at [elevenlabs.io](https://elevenlabs.io)
2. Go to Profile → API Keys and copy your key
3. Free tier: 10,000 characters/month — enough for light testing

## Local Development

    git clone https://github.com/YOUR_USERNAME/PlanesNearbyPodcast.git
    cd PlanesNearbyPodcast
    npm install
    cp .env.example .env        # then fill in your API keys

### Generate static audio files (one-time)

Three files need to live in `public/audio/` before the server starts:

| File | How to get it |
|---|---|
| `silence.mp3` | Generated automatically by `node scripts/setup-audio.js` — a single ~26 ms silent MP3 frame, no API key required |
| `intro.mp3` | You provide this — generate it with any TTS tool (e.g. ElevenLabs), or record your own welcome narration |
| `squelch.mp3` | You provide this — source a royalty-free radio tuning / squelch sound |

Run the setup script to write `silence.mp3` and verify the other two are present:

    node scripts/setup-audio.js

Commit all three files to the repository so they are available in every deployed environment.

Then start the dev server:

    npm run dev
    # Open: http://localhost:3000?ip=8.8.8.8
    # (127.0.0.1 cannot be geolocated — use ?ip= to test)

    npm test                    # run all tests
    npm test -- --testPathPattern=cache   # run one test file

## Deploy to Railway

**Step 1 — Push to GitHub**
Make sure your repo is on GitHub.

**Step 2 — Add static audio files**
Place `public/audio/intro.mp3` and `public/audio/squelch.mp3` (both user-provided — see Local Development above), then run the setup script and commit:

    node scripts/setup-audio.js   # writes silence.mp3; no API key required
    git add public/audio/
    git commit -m "chore: add static audio files"
    git push

**Step 3 — Create Railway project**
- Log in to railway.app
- Click New Project > Deploy from GitHub repo
- Select PlanesNearbyPodcast

**Step 4 — Set environment variables**
In your Railway service > Variables tab, add:

| Name | Value |
|---|---|
| IPGEO_API_KEY | Your IPGeolocation.io key |
| FLIGHTAWARE_API_KEY | Your FlightAware AeroAPI key |
| ELEVENLABS_API_KEY | Your ElevenLabs key |
| ELEVENLABS_VOICE_IDS | (Optional) Comma-separated voice IDs |

Railway injects PORT and NODE_ENV automatically.

**Step 5 — Enable PR preview deployments**
In Railway project Settings > find Preview Environments and toggle it ON.

**Step 6 — Add GitHub secrets for PR preview comments**

Get your Railway token: Railway dashboard > avatar (top-right) > Account Settings > Tokens > Create Token

Get your Railway project ID: Railway dashboard > your project > Settings tab > Project ID

In your GitHub repo > Settings > Secrets and variables > Actions, add:

| Secret name | Value |
|---|---|
| RAILWAY_TOKEN | Your Railway token |
| RAILWAY_PROJECT_ID | Your Railway project ID |

When you open a PR, a bot will post a comment with the preview URL once the deployment is ready.

**Step 7 — Verify**
Open the deployment URL from your Railway dashboard. You should see aircraft data for your location.

## Yoto Playlist Setup

The audio stream exposes a 21-track Yoto-compatible playlist. Each track is a URL pointing to your deployed server.

| Track | URL | Content |
|---|---|---|
| 1 | `https://YOUR_DOMAIN/stream/intro.mp3` | Welcome narration |
| 2 | `https://YOUR_DOMAIN/stream/squelch-1.mp3` | Short pause / squelch |
| 3 | `https://YOUR_DOMAIN/stream/aircraft-1.mp3` | Closest aircraft |
| 4 | `https://YOUR_DOMAIN/stream/squelch-2.mp3` | Short pause / squelch |
| 5 | `https://YOUR_DOMAIN/stream/aircraft-2.mp3` | 2nd closest aircraft |
| … | … | Alternating squelch + aircraft up to 10 aircraft |
| 21 | `https://YOUR_DOMAIN/stream/squelch-10.mp3` | Final squelch |

Tracks beyond the current aircraft count return silence automatically — no dead air errors on the Yoto player.

To configure the playlist in Yoto Studio, create a new card with 21 tracks and enter each URL above with your Railway deployment domain substituted for `YOUR_DOMAIN`.

## Project Structure

    src/
      server.js              Express app and routes
      cache.js               In-memory 5-minute TTL cache
      routes/
        stream.js            /stream/* router (intro, squelch, aircraft TTS)
      services/
        geolocation.js       IPGeolocation.io integration
        flightaware.js       FlightAware AeroAPI integration
        aircraft.js          Filtering, sorting, Haversine distance
        scriptGenerator.js   Kid-friendly text generation
        audioStore.js        In-memory Promise<Buffer> cache for TTS audio
        tts.js               ElevenLabs TTS wrapper
      views/
        page.js              SSR HTML page generator
    public/
      fa-logo.png            FlightAware attribution logo
      audio/
        intro.mp3            Generated welcome narration (ElevenLabs via setup-audio.js)
        silence.mp3          Single silent MP3 frame (~26 ms) — written by setup-audio.js
        squelch.mp3          Radio tuning sound — you provide this file
    scripts/
      setup-audio.js         One-time script to generate static audio files
    tests/                   Jest test suite
