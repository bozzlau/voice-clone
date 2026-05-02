"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Volume2, Mic, Clock, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "TTS", icon: Volume2 },
  { href: "/voices", label: "Voices", icon: Mic },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setApiKeyConfigured(data.exists))
      .catch(() => setApiKeyConfigured(false));
  }, []);

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card p-4">
      <h1 className="mb-8 text-lg font-bold tracking-tight">Voice Clone</h1>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={`h-2 w-2 rounded-full ${
            apiKeyConfigured === null
              ? "bg-yellow-400"
              : apiKeyConfigured
                ? "bg-green-500"
                : "bg-red-500"
          }`}
        />
        {apiKeyConfigured === null
          ? "Checking..."
          : apiKeyConfigured
            ? "API Key OK"
            : "No API Key"}
      </div>
    </aside>
  );
}
