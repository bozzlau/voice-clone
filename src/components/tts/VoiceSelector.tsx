"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface VoiceSelectorProps {
  value: string;
  onChange: (value: string | null) => void;
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/voices")
      .then((r) => r.json())
      .then((data) => setVoices(data.voices?.filter((v: any) => v.state === "trained") || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-2">
      <Label>Voice Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a voice..." />
        </SelectTrigger>
        <SelectContent>
          {voices.length === 0 && (
            <SelectItem value="" disabled>No trained voices available</SelectItem>
          )}
          {voices.map((v: any) => (
            <SelectItem key={v.id} value={String(v.id)}>
              {v.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
