#!/usr/bin/env node
/**
 * One-time setup: generates public/audio/intro.mp3 and public/audio/silence.mp3
 * via ElevenLabs TTS. Run after cloning a new environment:
 *
 *   ELEVENLABS_API_KEY=xxx node scripts/setup-audio.js
 *
 * public/audio/squelch.mp3 must be sourced manually from a royalty-free audio
 * library and placed in public/audio/ before running the server.
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { synthesize } = require('../src/services/tts');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

const ASSETS = [
  {
    file: 'intro.mp3',
    text: 'Welcome to Planes Nearby. Scanning the skies above you now — here\'s what\'s up there.',
  },
  {
    file: 'silence.mp3',
    // A single period produces the shortest possible ElevenLabs clip — a brief
    // near-silent audio frame used as a padding track between aircraft reports.
    text: '.',
  },
];

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY is not set.');
    process.exit(1);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  for (const asset of ASSETS) {
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
    console.warn('Source a royalty-free radio squelch sound and place it at that path.');
  }

  console.log('\nDone. Commit public/audio/*.mp3 to the repository.');
}

main().catch(err => { console.error(err); process.exit(1); });
