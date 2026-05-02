"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParameterControlsProps {
  speed: number;
  onSpeedChange: (v: number) => void;
  format: string;
  onFormatChange: (v: string | null) => void;
  temperature: number;
  onTemperatureChange: (v: number) => void;
}

export function ParameterControls({
  speed, onSpeedChange,
  format, onFormatChange,
  temperature, onTemperatureChange,
}: ParameterControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Speed: {speed.toFixed(1)}x</Label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Format</Label>
        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mp3">MP3</SelectItem>
            <SelectItem value="wav">WAV</SelectItem>
            <SelectItem value="opus">Opus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Temperature: {temperature.toFixed(1)}</Label>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.1"
          value={temperature}
          onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
