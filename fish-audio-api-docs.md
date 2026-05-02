# Fish Audio API Documentation

> Compiled from context7 and official sources on 2026-05-02.
> Official docs: https://docs.fish.audio/introduction
> API Reference: https://docs.fish.audio/api-reference/introduction
> Dashboard (API Keys): https://fish.audio/app/api-keys

---

## Base URL

```
https://api.fish.audio
```

---

## Authentication

All API requests require authentication via a Bearer token in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

**How to get an API key:**
1. Sign up at https://fish.audio/auth/signup
2. Go to https://fish.audio/app/api-keys
3. Click "Create New Key"

---

## Models (Voice Management)

### List Models

```http
GET /model
```

Returns all models for the authenticated user.

**Python SDK:**
```python
from fish_audio_sdk import Session
session = Session("your_api_key")
models = session.list_models()
print(models)
```

---

### Get Model

```http
GET /model/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Model ID |

**Response (200):**
```json
{
  "_id": "string",
  "type": "tts",
  "title": "string",
  "description": "string",
  "cover_image": "string",
  "train_mode": "fast",
  "state": "created|training|trained|failed",
  "tags": ["string"],
  "samples": [],
  "created_at": "datetime",
  "updated_at": "datetime",
  "languages": ["string"],
  "visibility": "public|unlist|private",
  "like_count": 0,
  "task_count": 0,
  "author": {}
}
```

**Python SDK:**
```python
model = session.get_model("your_model_id")
print(model)
```

---

### Create Model

```http
POST /model
```

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| title | string | Yes | - | Model name |
| type | string | Yes | - | Must be `"tts"` |
| voices | file[] | Yes | - | Audio files (samples) for voice cloning |
| description | string | No | - | Model description |
| visibility | string | No | `public` | `public`, `unlist`, or `private` |
| cover_image | file | No | - | Cover image (required if public) |
| train_mode | string | Yes | - | Must be `"fast"` |
| texts | string[] | No | - | Transcripts corresponding to voice files |
| tags | string[] | No | - | Model tags |
| enhance_audio_quality | bool | No | `false` | Enhance audio quality |

**Python SDK (sync):**
```python
model = session.create_model(
    title="My Voice",
    description="Custom voice model",
    voices=[open("sample1.mp3", "rb").read(), open("sample2.wav", "rb").read()],
    cover_image=open("cover.jpg", "rb").read(),
)
print(model)
```

**Python SDK (async):**
```python
model = await session.create_model.awaitable(
    title="test",
    description="test",
    voices=[voice_file.read(), other_voice_file.read()],
    cover_image=image_file.read(),
)
```

**REST API (raw requests):**
```python
import requests
response = requests.post(
    "https://api.fish.audio/model",
    files=[
        ("voices", open("sample1.mp3", "rb")),
        ("voices", open("sample2.wav", "rb"))
    ],
    data=[
        ("title", "My Voice Model"),
        ("description", "Custom voice model"),
        ("visibility", "private"),
        ("type", "tts"),
        ("train_mode", "fast"),
        ("enhance_audio_quality", "true")
    ],
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
result = response.json()
print(f"Model ID: {result['id']}")
```

---

### Delete Model

```http
DELETE /v1/voices/{voiceId}
```

**Python SDK (async):**
```python
await session.delete_model.awaitable("your_model_id")
```

**Response (200):**
```json
{
  "message": "Voice model deleted successfully."
}
```

---

## Text-to-Speech (TTS)

### POST /v1/tts (HTTP Stream)

```http
POST https://api.fish.audio/v1/tts
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
model: s2-pro
```

**Header Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| model | string | Yes | `s2-pro` | Model to use: `s1` or `s2-pro` |

**Request Body:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| text | string | Yes | - | Text to convert to speech |
| reference_id | string | No | - | Voice model ID |
| temperature | number | No | `0.7` | Randomness (0.0-1.0) |
| top_p | number | No | `0.7` | Nucleus sampling (0.0-1.0) |
| prosody.speed | number | No | `1.0` | Speech speed (0.5-2.0) |
| prosody.volume | number | No | `0` | Volume in dB (-20 to 20) |
| prosody.normalize_loudness | bool | No | `true` | Normalize loudness (S2-Pro only) |
| chunk_length | integer | No | `200` | Characters per chunk (100-300) |
| normalize | bool | No | `true` | Normalize input text |
| format | string | No | `mp3` | Output format: `mp3`, `wav`, `pcm`, `opus` |
| sample_rate | integer | No | - | Sample rate in Hz |
| mp3_bitrate | integer | No | `128` | MP3 bitrate: `64`, `128`, `192` |
| latency | string | No | `normal` | `normal` or `balanced` |
| max_new_tokens | integer | No | `1024` | Max tokens to generate |
| repetition_penalty | number | No | `1.2` | Repetition penalty |
| min_chunk_length | integer | No | `50` | Min chunk length |
| condition_on_previous_chunks | bool | No | `true` | Condition on previous chunks |
| early_stop_threshold | number | No | `1.0` | Early stopping threshold (0-1) |

**Request Example:**
```json
{
  "text": "Hello! Welcome to Fish Audio.",
  "reference_id": "model-id",
  "temperature": 0.7,
  "top_p": 0.7,
  "prosody": {
    "speed": 1,
    "volume": 0,
    "normalize_loudness": true
  },
  "chunk_length": 300,
  "normalize": true,
  "format": "mp3",
  "sample_rate": 44100,
  "mp3_bitrate": 128,
  "latency": "normal",
  "max_new_tokens": 1024,
  "repetition_penalty": 1.2,
  "min_chunk_length": 50,
  "condition_on_previous_chunks": true,
  "early_stop_threshold": 1
}
```

**Response:** Audio binary stream (chunked transfer encoding).

**Error Responses:**
| Code | Description |
|------|-------------|
| 401 | Unauthorized - no valid API key |
| 402 | Payment Required - no payment method |
| 422 | Validation Error - malformed request |

---

### Python SDK TTS (HTTP)

```python
from fish_audio_sdk import Session, TTSRequest

session = Session("your_api_key")

# Stream and save to file
with open("output.mp3", "wb") as f:
    for chunk in session.tts(TTSRequest(text="Hello, world!")):
        f.write(chunk)
```

**With reference audio:**
```python
from fish_audio_sdk import TTSRequest, ReferenceAudio

TTSRequest(
    text="Hello, world!",
    references=[
        ReferenceAudio(
            audio=audio_file.read(),
            text="reference audio text",
        )
    ],
)
```

---

### WebSocket TTS (/v1/tts/live) - Real-time Streaming

```
WebSocket wss://api.fish.audio/v1/tts/live?model=s2-pro
```

**Connection Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | `s1` or `s2-pro` |

**Protocol:** Messages use `application/msgpack` encoding.

**Events:**

1. **StartEvent** (first message, client → server):
```json
{
  "event": "start",
  "request": {
    "text": "",
    "max_new_tokens": 1024,
    "temperature": 0.7,
    "top_p": 0.7,
    "repetition_penalty": 1.2
  }
}
```

2. **TextEvent** (client → server): Send text chunks.
3. **Audio Chunks** (server → client): Binary audio data.
4. **Error Event** (server → client): Error information.

**Python SDK (async websocket):**
```python
from fishaudio import AsyncFishAudio, TTSConfig, ReferenceAudio, WebSocketOptions

client = AsyncFishAudio(api_key="...")

async def text_generator():
    yield "Hello, "
    yield "this is "
    yield "async streaming!"

# Simple usage
async with aiofiles.open("output.mp3", "wb") as f:
    async for audio_chunk in client.tts.stream_websocket(text_generator()):
        await f.write(audio_chunk)

# With voice model reference
async with aiofiles.open("output.mp3", "wb") as f:
    async for audio_chunk in client.tts.stream_websocket(
        text_generator(),
        reference_id="your_model_id"
    ):
        await f.write(audio_chunk)

# With reference audio for instant voice cloning
async with aiofiles.open("output.mp3", "wb") as f:
    async for audio_chunk in client.tts.stream_websocket(
        text_generator(),
        references=[ReferenceAudio(audio=audio_bytes, text="sample")]
    ):
        await f.write(audio_chunk)
```

**Python SDK (sync websocket):**
```python
from fishaudio import FishAudio

client = FishAudio(api_key="your_api_key")

def stream_text():
    text = "Hello, this is being generated in real time"
    for word in text.split():
        yield word + " "

audio_stream = client.tts.stream_websocket(
    stream_text(),
    reference_id="your_voice_model_id",
    temperature=0.7,
    top_p=0.7,
    latency="balanced"
)

with open("output.mp3", "wb") as f:
    for audio_chunk in audio_stream:
        f.write(audio_chunk)
```

**JavaScript SDK (websocket):**
```javascript
import { FishAudioClient, RealtimeEvents } from "fish-audio";
import { writeFile } from "fs/promises";

async function* makeTextStream() {
  const chunks = [
    "Hello from Fish Audio! ",
    "This is a realtime text-to-speech test. ",
    "We are streaming multiple chunks over WebSocket.",
  ];
  for (const chunk of chunks) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 200));
  }
}

const client = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });
const request = { text: "", reference_id: "your_voice_model_id" };

const connection = await client.textToSpeech.convertRealtime(request, makeTextStream());

const chunks = [];
connection.on(RealtimeEvents.OPEN, () => console.log("WebSocket opened"));
connection.on(RealtimeEvents.AUDIO_CHUNK, (audio) => {
  if (audio instanceof Uint8Array || Buffer.isBuffer(audio)) {
    chunks.push(Buffer.from(audio));
  }
});
connection.on(RealtimeEvents.ERROR, (err) => console.error("WebSocket error:", err));
connection.on(RealtimeEvents.CLOSE, async () => {
  await writeFile("out.mp3", Buffer.concat(chunks));
  console.log("Saved to out.mp3");
});
```

---

## SDK Installation

### Python (fish-audio-sdk - basic)
```bash
pip install fish-audio-sdk
```

```python
from fish_audio_sdk import Session
session = Session("your_api_key")
```

### Python (fishaudio - full featured with websocket)
```bash
pip install fishaudio
```

```python
from fishaudio import FishAudio  # sync
from fishaudio import AsyncFishAudio  # async

client = FishAudio(api_key="...")
```

### JavaScript
```bash
npm install fish-audio
```

---

## TTSConfig Object

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| format | string | `mp3` | `mp3`, `wav`, `pcm`, `opus` |
| sample_rate | int | None | Audio sample rate in Hz |
| mp3_bitrate | int | `128` | `64`, `128`, `192` kbps |
| opus_bitrate | int | `32` | `-1000`, `24`, `32`, `48`, `64` kbps |
| normalize | bool | `True` | Normalize/clean input text |
| chunk_length | int | `200` | Characters per chunk (100-300) |
| latency | string | `balanced` | `normal` or `balanced` |
| reference_id | string | None | Voice model ID |
| references | list | `[]` | Reference audio samples for instant cloning |
| prosody | object | None | `{speed, volume}` settings |
| top_p | float | `0.7` | Nucleus sampling (0.0-1.0) |
| temperature | float | `0.7` | Randomness (0.0-1.0) |
| max_new_tokens | int | `1024` | Max tokens to generate |
| repetition_penalty | float | `1.2` | Repetition penalty |
| min_chunk_length | int | `50` | Min chunk length |
| condition_on_previous_chunks | bool | `True` | Context from previous chunks |
| early_stop_threshold | float | `1.0` | Early stopping (0-1) |

---

## Model States

| State | Description |
|-------|-------------|
| `created` | Model created, waiting to train |
| `training` | Model is being trained |
| `trained` | Model ready to use |
| `failed` | Training failed |

---

## Notes

- **Recommended model:** `s2-pro` (supports multi-speaker dialogue synthesis)
- **Self-hosting:** Fish Speech can be self-hosted. Inference endpoint: `POST http://localhost:8080/v1/tts`
- **Custom base URL** can be configured in SDK for proxy usage.
- Official docs not directly fetchable due to access restrictions — refer to the URLs above for the most up-to-date information.
