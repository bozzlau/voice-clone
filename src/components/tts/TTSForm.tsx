"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceSelector } from "./VoiceSelector";
import { ParameterControls } from "./ParameterControls";
import { AudioPlayer } from "./AudioPlayer";
import { ChevronLeft, ChevronRight, Loader2, History, Trash2, Download, Play } from "lucide-react";
import { toast } from "sonner";
import type { TTSHistoryItem } from "@/lib/types";

export function TTSForm() {
  const [voiceModelId, setVoiceModelId] = useState("");
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(1.0);
  const [format, setFormat] = useState("mp3");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<TTSHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/tts-history?page=1&pageSize=50");
      const data = await res.json();
      setHistory(data.items || []);
    } catch {
      // silent
    }
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setHistoryPage(1);
  }, [history.length]);

  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const pagedHistory = history.slice((historyPage - 1) * pageSize, historyPage * pageSize);

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
      fetchHistory();
    } catch {
      toast.error("Failed to generate speech");
    }
    setLoading(false);
  };

  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());

  const handlePlay = (id: number) => {
    if (playingId === id) {
      // Pause current
      const audio = audioRefs.current.get(id);
      if (audio) { audio.pause(); }
      setPlayingId(null);
      return;
    }
    // Stop any other playing audio
    audioRefs.current.forEach((a) => { a.pause(); a.currentTime = 0; });
    // Start new one
    const audio = audioRefs.current.get(id);
    if (audio) {
      audio.play();
      setPlayingId(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/tts-history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
        audioRefs.current.delete(id);
        toast.success("Deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
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

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <History className="h-4 w-4" />
          History
        </div>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet</p>
        ) : (
          <div className="space-y-2">
            {pagedHistory.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{item.inputText}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.voiceModelName} &middot; {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <audio
                    src={`/api/audio/${item.audioFilePath}`}
                    ref={(el) => { if (el) audioRefs.current.set(item.id, el); }}
                    onEnded={() => setPlayingId(null)}
                    className="hidden"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handlePlay(item.id)} title="Play">
                    {playingId === item.id ? (
                      <div className="flex gap-0.5">
                        <span className="h-3 w-0.5 animate-pulse bg-foreground rounded" />
                        <span className="h-3 w-0.5 animate-pulse bg-foreground rounded" style={{ animationDelay: "0.2s" }} />
                        <span className="h-3 w-0.5 animate-pulse bg-foreground rounded" style={{ animationDelay: "0.4s" }} />
                      </div>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <a href={`/api/audio/${item.audioFilePath}`} download={`tts-${item.id}.${item.audioFormat}`}>
                    <Button variant="ghost" size="icon" type="button" title="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {historyPage} / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={historyPage >= totalPages} onClick={() => setHistoryPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
