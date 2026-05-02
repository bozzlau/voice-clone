"use client";

import { Button } from "@/components/ui/button";
import { Play, Download, Trash2 } from "lucide-react";

interface HistoryItemProps {
  item: {
    id: number;
    voiceModelName: string;
    inputText: string;
    audioFormat: string;
    audioFilePath: string;
    createdAt: string;
  };
  onDelete: (id: number) => void;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const audioUrl = `/api/audio/${item.audioFilePath}`;

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{item.inputText}</p>
        <p className="text-xs text-muted-foreground">
          {item.voiceModelName} &middot; {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <audio src={audioUrl} controls className="h-8 w-40" />
        <a href={audioUrl} download={`tts-${item.id}.${item.audioFormat}`}>
          <Button variant="ghost" size="icon" type="button">
            <Download className="h-4 w-4" />
          </Button>
        </a>
        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
