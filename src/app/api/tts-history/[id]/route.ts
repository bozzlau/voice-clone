import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { deleteAudio } from "@/lib/audio-storage";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const record = db
    .select()
    .from(schema.ttsHistory)
    .where(eq(schema.ttsHistory.id, Number(id)))
    .get();

  if (!record) {
    return NextResponse.json({ error: "History record not found" }, { status: 404 });
  }

  // Delete audio file
  deleteAudio(record.audioFilePath);

  // Delete DB record
  db.delete(schema.ttsHistory)
    .where(eq(schema.ttsHistory.id, Number(id)))
    .run();

  return NextResponse.json({ success: true });
}
