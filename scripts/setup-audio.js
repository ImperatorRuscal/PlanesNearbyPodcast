#!/usr/bin/env node
/**
 * One-time setup: generates public/audio/intro.mp3 (via ElevenLabs) and
 * public/audio/silence.mp3 (a single silent MP3 frame — no API call needed).
 * Run after cloning a new environment:
 *
 *   ELEVENLABS_API_KEY=xxx node scripts/setup-audio.js
 *
 * public/audio/squelch.mp3 must be sourced manually (a royalty-free radio
 * squelch/tuning sound) and placed in public/audio/ before running the server.
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { synthesize } = require('../src/services/tts');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

/**
 * Minimal silent MP3 frame — MPEG-1, Layer 3, 128 kbps, 44100 Hz, mono.
 * Frame size: 417 bytes (4 header + 17 side-info + 396 main-data).
 * Duration: ~26 ms. global_gain=0 + big_values=0 → all samples decode to zero.
 * No external API or library required.
 */
const SILENCE_MP3 = Buffer.concat([
  Buffer.from([0xff, 0xfb, 0x90, 0xc4]),  // sync + MPEG1 + Layer3 + NoCRC + 128kbps + 44100Hz + mono + original
  Buffer.alloc(413),                        // 17 bytes side-info (zeros) + 396 bytes main-data (zeros)
]);

const TTS_ASSETS = [
  {
    file: 'intro.mp3',
    text: 'Welcome to Planes Nearby. Scanning the skies above you now — here\'s what\'s up there.',
  },
];

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY is not set.');
    process.exit(1);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  // Write silence.mp3 from the hardcoded buffer — no API call needed.
  const silencePath = path.join(AUDIO_DIR, 'silence.mp3');
  if (fs.existsSync(silencePath)) {
    console.log('Skipping silence.mp3 — already exists');
  } else {
    const tmp = silencePath + '.tmp';
    fs.writeFileSync(tmp, SILENCE_MP3);
    fs.renameSync(tmp, silencePath);
    console.log(`Written ${SILENCE_MP3.length} bytes to ${silencePath} (single silent MP3 frame)`);
  }

  // Generate TTS assets via ElevenLabs.
  for (const asset of TTS_ASSETS) {
    const dest = path.join(AUDIO_DIR, asset.file);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${asset.file} — already exists`);
      continue;
    }
    console.log(`Generating ${asset.file}...`);
    const buf = await synthesize(asset.text);
    const tmp = dest + '.tmp';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, dest);
    console.log(`  Written ${buf.length} bytes to ${dest}`);
  }

  const squelchPath = path.join(AUDIO_DIR, 'squelch.mp3');
  if (!fs.existsSync(squelchPath)) {
    console.warn('\nWARNING: public/audio/squelch.mp3 is missing.');
    console.warn('Source a royalty-free radio squelch/tuning sound and place it at that path.');
  }

  console.log('\nDone. Commit public/audio/*.mp3 to the repository.');
}

main().catch(err => { console.error(err); process.exit(1); });
