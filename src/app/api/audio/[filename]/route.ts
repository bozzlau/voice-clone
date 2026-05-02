import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { getAudioPath, getContentType } from "@/lib/audio-storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Security: prevent directory traversal
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = getAudioPath(filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop() || "mp3";
  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": getContentType(ext),
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
