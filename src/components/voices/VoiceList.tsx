"use client";

import { VoiceCard } from "./VoiceCard";

interface VoiceListProps {
  voices: Array<{
    id: number;
    name: string;
    description: string;
    state: string;
    createdAt: string;
    fishModelId: string;
  }>;
  onRefresh: (id: number) => void;
  onDelete: (id: number) => void;
}

export function VoiceList({ voices, onRefresh, onDelete }: VoiceListProps) {
  if (voices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg">No voice models yet</p>
        <p className="text-sm">Create your first voice model to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {voices.map((voice) => (
        <VoiceCard
          key={voice.id}
          voice={voice}
          onRefresh={onRefresh}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
