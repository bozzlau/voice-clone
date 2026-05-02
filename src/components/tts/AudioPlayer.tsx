"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  format: string;
}

export function AudioPlayer({ audioUrl, format }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `tts-output.${format}`;
    a.click();
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <audio ref={audioRef} src={audioUrl} controls className="flex-1" />
      <Button variant="outline" size="icon" onClick={handleDownload} title="Download">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
