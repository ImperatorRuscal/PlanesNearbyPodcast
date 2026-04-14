let fetchMock;

beforeEach(() => {
  jest.resetModules();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
  process.env.ELEVENLABS_API_KEY = 'test-key';
  process.env.ELEVENLABS_VOICE_IDS = 'voice-aaa,voice-bbb';
  process.env.ELEVENLABS_MODEL_ID = 'eleven_flash_v2_5';
  process.env.ELEVENLABS_SPEED = '1.0';
  process.env.ELEVENLABS_STABILITY = '0.45';
  process.env.ELEVENLABS_SIMILARITY = '0.80';
});

afterEach(() => {
  delete global.fetch;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_IDS;
  delete process.env.ELEVENLABS_MODEL_ID;
  delete process.env.ELEVENLABS_SPEED;
  delete process.env.ELEVENLABS_STABILITY;
  delete process.env.ELEVENLABS_SIMILARITY;
});

test('synthesize returns a Buffer on success', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  const result = await synthesize('Hello world');
  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test('synthesize calls ElevenLabs with correct request shape', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  await synthesize('Test text');

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toMatch(/api\.elevenlabs\.io\/v1\/text-to-speech\//);
  expect(options.method).toBe('POST');
  expect(options.headers['xi-api-key']).toBe('test-key');
  expect(options.headers['Content-Type']).toBe('application/json');

  const body = JSON.parse(options.body);
  expect(body.text).toBe('Test text');
  expect(body.model_id).toBe('eleven_flash_v2_5');
  expect(body.voice_settings.stability).toBe(0.45);
  expect(body.voice_settings.similarity_boost).toBe(0.80);
  expect(body.voice_settings.speed).toBe(1.0);
});

test('synthesize picks a voice from VOICE_IDS (may be either)', async () => {
  const fakeAudio = Buffer.from('fake-mp3-bytes');
  fetchMock.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => fakeAudio.buffer,
  });

  const { synthesize } = require('../src/services/tts');
  await synthesize('Pick a voice');

  const [url] = fetchMock.mock.calls[0];
  expect(url).toMatch(/voice-aaa|voice-bbb/);
});

test('synthesize throws on non-ok response', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    status: 401,
    text: async () => 'Unauthorized',
  });

  const { synthesize } = require('../src/services/tts');
  await expect(synthesize('Hello')).rejects.toThrow('ElevenLabs API error 401');
});

test('synthesize throws on empty text', async () => {
  const { synthesize } = require('../src/services/tts');
  await expect(synthesize('')).rejects.toThrow('synthesize: text must be non-empty');
  await expect(synthesize('   ')).rejects.toThrow('synthesize: text must be non-empty');
});
