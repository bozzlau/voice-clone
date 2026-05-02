"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceSelector } from "./VoiceSelector";
import { ParameterControls } from "./ParameterControls";
import { AudioPlayer } from "./AudioPlayer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TTSForm() {
  const [voiceModelId, setVoiceModelId] = useState("");
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [format, setFormat] = useState("mp3");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!voiceModelId) { toast.error("Please select a voice"); return; }
    if (!text.trim()) { toast.error("Please enter text"); return; }

    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceModelId: Number(voiceModelId), format, speed, temperature }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Generation failed");
        return;
      }
      const data = await res.json();
      setAudioUrl(data.audioUrl);
      toast.success("TTS generated successfully");
    } catch {
      toast.error("Failed to generate speech");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <VoiceSelector value={voiceModelId} onChange={(v) => v && setVoiceModelId(v)} />
      <div className="space-y-2">
        <Textarea
          placeholder="Enter text to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">{text.length} chars</p>
      </div>
      <ParameterControls
        speed={speed}
        onSpeedChange={setSpeed}
        format={format}
        onFormatChange={(v) => v && setFormat(v)}
        temperature={temperature}
        onTemperatureChange={setTemperature}
      />
      <Button onClick={handleGenerate} disabled={loading || !text.trim() || !voiceModelId} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Generating..." : "Generate Speech"}
      </Button>
      {audioUrl && <AudioPlayer audioUrl={audioUrl} format={format} />}
    </div>
  );
}
