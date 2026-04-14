#!/usr/bin/env node
/**
 * One-time setup: writes public/audio/silence.mp3 (a single silent MP3 frame —
 * no API call needed) and checks that the two user-provided static audio files
 * are present.
 *
 *   node scripts/setup-audio.js
 *
 * User-provided files (commit these to the repository):
 *   public/audio/intro.mp3    — welcome narration; generate with any TTS tool
 *   public/audio/squelch.mp3  — radio tuning sound; source a royalty-free clip
 */
const fs   = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

/**
 * Minimal silent MP3 frame — MPEG-1, Layer 3, 128 kbps, 44100 Hz, mono.
 * Frame size: 417 bytes (4 header + 17 side-info + 396 main-data).
 * Duration: ~26 ms. global_gain=0 + big_values=0 → all samples decode to zero.
 */
const SILENCE_MP3 = Buffer.concat([
  Buffer.from([0xff, 0xfb, 0x90, 0xc4]),  // sync + MPEG1 + Layer3 + NoCRC + 128kbps + 44100Hz + mono + original
  Buffer.alloc(413),                        // 17 bytes side-info (zeros) + 396 bytes main-data (zeros)
]);

function main() {
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

  // Check for user-provided static files.
  let allPresent = true;
  for (const file of ['intro.mp3', 'squelch.mp3']) {
    if (!fs.existsSync(path.join(AUDIO_DIR, file))) {
      console.warn(`WARNING: public/audio/${file} is missing.`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    console.warn('\nPlace the missing files in public/audio/ before starting the server.');
    console.warn('  intro.mp3   — generate with any TTS tool (e.g. ElevenLabs)');
    console.warn('  squelch.mp3 — royalty-free radio tuning/squelch clip');
  }

  console.log('\nDone. Commit public/audio/*.mp3 to the repository.');
}

main();
