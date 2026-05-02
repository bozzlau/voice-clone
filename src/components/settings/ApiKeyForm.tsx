"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    setValidationStatus("validating");
    try {
      const res = await fetch("/api/settings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      setValidationStatus(data.valid ? "valid" : "invalid");
      setValidationMessage(data.message);
    } catch {
      setValidationStatus("invalid");
      setValidationMessage("Network error");
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "api_key", value: apiKey.trim() }),
      });
      if (res.ok) {
        toast.success("API Key saved successfully");
      } else {
        toast.error("Failed to save API Key");
      }
    } catch {
      toast.error("Failed to save API Key");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fish Audio API Key</CardTitle>
        <CardDescription>
          Enter your Fish Audio API key. You can get one from fish.audio/app/api-keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidationStatus("idle");
            }}
          />
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={!apiKey.trim() || validationStatus === "validating"}
          >
            {validationStatus === "validating" ? "Validating..." : "Validate"}
          </Button>
        </div>
        {validationStatus !== "idle" && (
          <div className="flex items-center gap-2">
            <Badge
              variant={validationStatus === "valid" ? "default" : "destructive"}
            >
              {validationStatus === "valid" ? "Valid" : "Invalid"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {validationMessage}
            </span>
          </div>
        )}
        <Button onClick={handleSave} disabled={!apiKey.trim()}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
