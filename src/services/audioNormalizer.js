'use strict';

const { spawn }  = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// Integrated loudness target (LUFS). Initialised to -16 (streaming/podcast standard)
// then updated at startup by measuring intro.mp3 so TTS output matches it exactly.
let targetLufs = -16;

// ── helpers ──────────────────────────────────────────────────────────────────

function runFfmpeg(args, inputBuffer) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args);
    const chunks = [];
    const errLines = [];

    proc.stdout.on('data', chunk => chunks.push(chunk));
    proc.stderr.on('data', d => errLines.push(d.toString()));
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0 && !chunks.length) {
        return reject(new Error(`ffmpeg exited ${code}: ${errLines.join('')}`));
      }
      resolve({ stdout: Buffer.concat(chunks), stderr: errLines.join('') });
    });

    if (inputBuffer) {
      proc.stdin.end(inputBuffer);
    }
  });
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Measure the integrated loudness of a file and store it as the normalize
 * target. Call once at startup with the path to intro.mp3.
 */
async function initTargetLufs(introPath) {
  try {
    const { stderr } = await runFfmpeg([
      '-i', introPath,
      '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
      '-f', 'null', '-',
    ]);
    const m = stderr.match(/"input_i"\s*:\s*"(-?\d+(?:\.\d+)?)"/);
    if (m) {
      const measured = parseFloat(m[1]);
      if (isFinite(measured)) {
        targetLufs = measured;
        console.log(`[normalizer] intro.mp3 at ${targetLufs.toFixed(1)} LUFS — using as target`);
        return;
      }
    }
    console.warn('[normalizer] could not parse intro LUFS; using default', targetLufs);
  } catch (err) {
    console.warn('[normalizer] intro measurement failed; using default', targetLufs, err.message);
  }
}

/**
 * Normalize an MP3 buffer to targetLufs using ffmpeg's loudnorm filter.
 * Returns a new MP3 Buffer. Throws on ffmpeg error (caller should catch and
 * fall back to the raw buffer).
 */
async function normalize(inputBuffer) {
  const { stdout } = await runFfmpeg([
    '-f', 'mp3', '-i', 'pipe:0',
    '-af', `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`,
    '-c:a', 'libmp3lame', '-b:a', '128k',
    '-f', 'mp3', 'pipe:1',
  ], inputBuffer);
  return stdout;
}

module.exports = { initTargetLufs, normalize };
