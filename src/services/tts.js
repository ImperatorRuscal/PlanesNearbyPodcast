const VOICE_IDS = (process.env.ELEVENLABS_VOICE_IDS || 'cFfI4lpGYOvHRUeMr44m,7FroLDTDG92jPfUW6BlQ')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const MODEL_ID    = process.env.ELEVENLABS_MODEL_ID  || 'eleven_flash_v2_5';
const SPEED       = parseFloat(process.env.ELEVENLABS_SPEED       || '1.0');
const STABILITY   = parseFloat(process.env.ELEVENLABS_STABILITY   || '0.45');
const SIMILARITY  = parseFloat(process.env.ELEVENLABS_SIMILARITY  || '0.80');

async function synthesize(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set');

  const voiceId = VOICE_IDS[Math.floor(Math.random() * VOICE_IDS.length)];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: STABILITY,
        similarity_boost: SIMILARITY,
        speed: SPEED,
      },
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`ElevenLabs API error ${res.status}: ${msg}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

module.exports = { synthesize };
