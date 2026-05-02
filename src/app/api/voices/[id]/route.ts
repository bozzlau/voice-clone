import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { FishAudioClient } from "@/lib/fish-audio";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "true";

  const voice = db
    .select()
    .from(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(id)))
    .get();

  if (!voice) {
    return NextResponse.json({ error: "Voice model not found" }, { status: 404 });
  }

  if (refresh) {
    const apiKeyRow = db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "api_key"))
      .get();

    if (apiKeyRow?.value) {
      try {
        const client = new FishAudioClient(apiKeyRow.value);
        const fishModel = await client.getModel(voice.fishModelId);

        const newState: typeof voice.state = (["created", "training", "trained", "failed"].includes(fishModel.state)
          ? fishModel.state
          : voice.state) as typeof voice.state;
        db.update(schema.voiceModels)
          .set({ state: newState, updatedAt: new Date().toISOString() })
          .where(eq(schema.voiceModels.id, voice.id))
          .run();

        return NextResponse.json({ ...voice, state: newState });
      } catch (e) {
        console.error("Failed to refresh model state:", e);
      }
    }
  }

  return NextResponse.json(voice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action !== "refresh") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const voice = db
    .select()
    .from(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(id)))
    .get();

  if (!voice) {
    return NextResponse.json({ error: "Voice model not found" }, { status: 404 });
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
    const fishModel = await client.getModel(voice.fishModelId);

    const fishState = ["created", "training", "trained", "failed"].includes(fishModel.state as string)
      ? (fishModel.state as typeof voice.state)
      : voice.state;
    const now = new Date().toISOString();
    db.update(schema.voiceModels)
      .set({ state: fishState, updatedAt: now })
      .where(eq(schema.voiceModels.id, voice.id))
      .run();

    const updated = db
      .select()
      .from(schema.voiceModels)
      .where(eq(schema.voiceModels.id, Number(id)))
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to refresh: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const voice = db
    .select()
    .from(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(id)))
    .get();

  if (!voice) {
    return NextResponse.json({ error: "Voice model not found" }, { status: 404 });
  }

  // Try to delete from Fish Audio, but don't fail if it errors
  const apiKeyRow = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "api_key"))
    .get();

  if (apiKeyRow?.value) {
    try {
      const client = new FishAudioClient(apiKeyRow.value);
      await client.deleteModel(voice.fishModelId);
    } catch (e) {
      console.warn("Failed to delete model from Fish Audio:", e);
      // Continue with local deletion
    }
  }

  db.delete(schema.voiceModels)
    .where(eq(schema.voiceModels.id, Number(id)))
    .run();

  return NextResponse.json({ success: true });
}
