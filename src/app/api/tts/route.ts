import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { FishAudioClient } from "@/lib/fish-audio";
import { saveAudio } from "@/lib/audio-storage";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, voiceModelId, format, speed, temperature, saveToHistory } = body;

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (!voiceModelId) {
    return NextResponse.json({ error: "voiceModelId is required" }, { status: 400 });
  }

  const voice = db
    .select()
    .from(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(voiceModelId)))
    .get();

  if (!voice) {
    return NextResponse.json({ error: "Voice model not found" }, { status: 404 });
  }

  if (voice.state !== "trained") {
    return NextResponse.json(
      { error: `Voice model is not ready (state: ${voice.state})` },
      { status: 400 }
    );
  }

  const apiKeyRow = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "api_key"))
    .get();

  if (!apiKeyRow?.value) {
    return NextResponse.json({ error: "API key not configured" }, { status: 400 });
  }

  try {
    const client = new FishAudioClient(apiKeyRow.value);
    const audioFormat = format || "mp3";

    const fishResponse = await client.generateTTS({
      text,
      referenceId: voice.fishModelId,
      format: audioFormat,
      prosody: {
        speed: speed || 1.0,
      },
      temperature: temperature || 0.7,
      latency: "balanced",
    });

    const audioBuffer = Buffer.from(await fishResponse.arrayBuffer());

    // Save audio file
    const filename = saveAudio(audioBuffer, audioFormat);

    const params = { speed: speed || 1.0, temperature: temperature || 0.7 };

    // Record history
    if (saveToHistory !== false) {
      const now = new Date().toISOString();
      db.insert(schema.ttsHistory)
        .values({
          voiceModelId: voice.id,
          voiceModelName: voice.name,
          inputText: text,
          audioFormat,
          parameters: params,
          audioFilePath: filename,
          createdAt: now,
        })
        .run();
    }

    return NextResponse.json({
      audioUrl: `/api/audio/${filename}`,
      historyId: null,
      format: audioFormat,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TTS generation failed:", error);
    return NextResponse.json(
      { error: `TTS failed: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 502 }
    );
  }
}
