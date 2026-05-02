import { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { FishAudioClient } from "@/lib/fish-audio";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { text } = body;

  if (!text) {
    return new Response(JSON.stringify({ error: "Text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const voice = db
    .select()
    .from(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(id)))
    .get();

  if (!voice) {
    return new Response(JSON.stringify({ error: "Voice model not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (voice.state !== "trained") {
    return new Response(JSON.stringify({ error: "Voice model is not ready yet" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKeyRow = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "api_key"))
    .get();

  if (!apiKeyRow?.value) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = new FishAudioClient(apiKeyRow.value);
    const fishResponse = await client.generateTTS({
      text,
      referenceId: voice.fishModelId,
      format: "mp3",
      latency: "balanced",
    });

    // Return audio directly
    const audioBuffer = Buffer.from(await fishResponse.arrayBuffer());
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `TTS failed: ${error instanceof Error ? error.message : "Unknown"}` }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
