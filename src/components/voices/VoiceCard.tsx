"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePreview } from "./VoicePreview";
import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Play, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VoiceCardProps {
  voice: {
    id: number;
    name: string;
    description: string;
    state: string;
    createdAt: string;
    fishModelId: string;
  };
  onRefresh: (id: number) => void;
  onDelete: (id: number) => void;
}

const stateColors: Record<string, "secondary" | "default" | "destructive"> = {
  created: "secondary",
  training: "default",
  trained: "default",
  failed: "destructive",
};

export function VoiceCard({ voice, onRefresh, onDelete }: VoiceCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/voices/${voice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      if (res.ok) {
        onRefresh(voice.id);
        toast.success("State refreshed");
      } else {
        toast.error("Failed to refresh");
      }
    } catch {
      toast.error("Failed to refresh");
    }
    setRefreshing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{voice.name}</CardTitle>
          <Badge variant={stateColors[voice.state] || "secondary"}>
            {voice.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="line-clamp-2">{voice.description || "No description"}</p>
        <p className="mt-2 text-xs">
          Created: {new Date(voice.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "..." : "Refresh"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
          <Play className="mr-1 h-3 w-3" />
          Preview
        </Button>
        <Dialog>
          <DialogTrigger >
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Voice Model</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{voice.name}&rdquo;? This also deletes it from Fish Audio.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose >
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={() => onDelete(voice.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
      {showPreview && (
        <VoicePreview voiceId={voice.id} voiceName={voice.name} onClose={() => setShowPreview(false)} />
      )}
    </Card>
  );
}
