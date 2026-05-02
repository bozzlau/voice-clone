"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function VoiceUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const handleVisibilityChange = (v: string | null) => {
    if (v) setVisibility(v);
  };
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (files.length === 0) { toast.error("At least one audio sample is required"); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("visibility", visibility);
      formData.append("trainMode", "fast");
      files.forEach((file) => formData.append("voices", file));

      const res = await fetch("/api/voices", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Voice model created! Training may take a few minutes.");
        router.push("/voices");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create model");
      }
    } catch {
      toast.error("Failed to create model");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="title">Model Name</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Voice" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this voice..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select value={visibility} onValueChange={handleVisibilityChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="unlist">Unlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Audio Samples</Label>
        <div className="flex items-center gap-2">
          <Input type="file" accept="audio/*" multiple onChange={handleFileChange} className="flex-1" />
        </div>
        {files.length > 0 && (
          <ul className="text-sm text-muted-foreground">
            {files.map((f, i) => (
              <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">Upload WAV or MP3 files, ~10-60 seconds each.</p>
      </div>
      {submitting && <Progress value={50} className="w-full" />}
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {submitting ? "Creating Model..." : "Create Voice Model"}
      </Button>
    </form>
  );
}
