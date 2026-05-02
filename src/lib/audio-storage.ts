import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const AUDIO_DIR = path.join(process.cwd(), "data", "audio");

const MIME_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  pcm: "audio/L16",
  opus: "audio/ogg",
};

export function ensureAudioDir(): void {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
}

export function saveAudio(buffer: Buffer, format: string): string {
  ensureAudioDir();
  const filename = `${uuidv4()}.${format}`;
  const filePath = path.join(AUDIO_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
}

export function getAudioPath(filename: string): string {
  return path.join(AUDIO_DIR, filename);
}

export function deleteAudio(filename: string): boolean {
  const filePath = path.join(AUDIO_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function getContentType(format: string): string {
  return MIME_TYPES[format] || "application/octet-stream";
}

export { AUDIO_DIR };
