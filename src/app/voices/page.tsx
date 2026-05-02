"use client";

import { useEffect, useState, useCallback } from "react";
import { VoiceList } from "@/components/voices/VoiceList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { VoiceModel } from "@/lib/types";

export default function VoicesPage() {
  const [voices, setVoices] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVoices = useCallback(async () => {
    try {
      const res = await fetch("/api/voices");
      const data = await res.json();
      setVoices(data.voices || []);
    } catch {
      toast.error("Failed to load voice models");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  // Auto-poll every 10s if any model is in training/created state
  useEffect(() => {
    const hasPending = voices.some(
      (v: VoiceModel) => v.state === "created" || v.state === "training"
    );
    if (!hasPending) return;
    const interval = setInterval(fetchVoices, 10000);
    return () => clearInterval(interval);
  }, [voices, fetchVoices]);

  const handleRefresh = (_id: number) => {
    fetchVoices();
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/voices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVoices((prev) => prev.filter((v) => v.id !== id));
        toast.success("Voice model deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Voice Models</h2>
        <Link href="/voices/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Create
          </Button>
        </Link>
      </div>
      <VoiceList voices={voices} onRefresh={handleRefresh} onDelete={handleDelete} />
    </div>
  );
}
