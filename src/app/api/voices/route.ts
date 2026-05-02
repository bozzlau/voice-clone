import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { FishAudioClient } from "@/lib/fish-audio";
import { desc, eq } from "drizzle-orm";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const voices = db
    .select()
    .from(schema.voiceModels)
    .orderBy(desc(schema.voiceModels.createdAt))
    .all();

  return NextResponse.json({ voices });
}

export async function POST(request: NextRequest) {
  // Read API key
  const apiKeyRow = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "api_key"))
    .get();

  if (!apiKeyRow?.value) {
    return NextResponse.json(
      { error: "API key not configured. Please add your Fish Audio API key in Settings." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const visibility = (formData.get("visibility") as string) || "private";
    const trainMode = (formData.get("trainMode") as string) || "fast";
    const voiceFiles = formData.getAll("voices") as File[];

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!voiceFiles || voiceFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one voice sample is required" },
        { status: 400 }
      );
    }

    const client = new FishAudioClient(apiKeyRow.value);

    // Convert File objects to buffers, converting m4a to wav for Fish Audio compatibility
    const voices = await Promise.all(
      voiceFiles.map(async (file) => {
        const isM4a = file.name.toLowerCase().endsWith(".m4a") || file.type === "audio/mp4" || file.type === "audio/x-m4a";
        let buffer = Buffer.from(await file.arrayBuffer());
        let filename = file.name;
        let contentType = file.type;

        if (isM4a) {
          const tmpDir = path.join(process.cwd(), "data", "tmp");
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
          const inputPath = path.join(tmpDir, `${uuidv4()}.m4a`);
          const outputPath = path.join(tmpDir, `${uuidv4()}.wav`);
          try {
            fs.writeFileSync(inputPath, buffer);
            execSync(`ffmpeg -y -i "${inputPath}" -acodec pcm_s16le -ar 44100 -ac 1 "${outputPath}"`, {
              stdio: "ignore",
              timeout: 30000,
            });
            buffer = fs.readFileSync(outputPath);
            filename = filename.replace(/\.m4a$/i, ".wav");
            contentType = "audio/wav";
          } finally {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          }
        }

        return { buffer, filename, contentType };
      })
    );

    const result = await client.createModel({
      title,
      description,
      type: "tts",
      trainMode: trainMode as "fast",
      visibility: visibility as "public" | "unlist" | "private",
      voices,
    });

    const modelId = (result.id || result._id) as string;
    const now = new Date().toISOString();

    db.insert(schema.voiceModels)
      .values({
        name: title,
        description,
        fishModelId: modelId,
        state: (["created", "training", "trained", "failed"].includes(result.state as string)
          ? (result.state as "created" | "training" | "trained" | "failed")
          : "created") as "created" | "training" | "trained" | "failed",
        trainMode: trainMode as "fast",
        visibility: visibility as "public" | "unlist" | "private",
        audioSamples: voiceFiles.map((f) => f.name),
        createdAt: now,
        updatedAt: now,
      } as any)
      .run();

    const created = db
      .select()
      .from(schema.voiceModels)
      .where(eq(schema.voiceModels.fishModelId, modelId))
      .get();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create voice model:", error);
    return NextResponse.json(
      { error: `Failed to create model: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 502 }
    );
  }
}
