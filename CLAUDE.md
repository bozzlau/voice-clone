# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build (includes TypeScript check)
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project Overview

Local voice cloning website using Fish Audio API. Single-user, data stored in local SQLite.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui v4 (uses `@base-ui/react`, NOT `@radix-ui/react`) + Drizzle ORM + better-sqlite3 (WAL mode)

## Architecture

### Data Layer (`src/lib/db/`)
- `schema.ts` — 3 tables: `voice_models` (training status FSM: created → training → trained/failed), `tts_history`, `settings` (key-value for API key)
- `index.ts` — Drizzle client singleton, auto-creates `data/` and `data/audio/` dirs
- JSON columns use `{ mode: "json" }` + `.default([])` / `.default({})` (NOT string)
- Schema changes require `npx drizzle-kit generate && npx drizzle-kit migrate` — but since this is a local single-user app, manual DDL is also acceptable

### API Layer (`src/app/api/`)
13 routes, all proxy through Next.js to keep API key server-side:
- `settings/` — GET (prefix only, never full key), PUT (upsert), validate
- `voices/` — GET list, POST create (multipart → Fish Audio → DB), GET/PATCH/DELETE by id, POST `[id]/tts` (preview)
- `tts/` — POST generate (Fish Audio → save audio file → record history)
- `audio/[filename]` — GET serve file (directory traversal protected)
- `tts-history/` — GET paginated, DELETE by id

### Fish Audio Integration (`src/lib/fish-audio.ts`)
- `FishAudioClient` class wrapping REST API at `https://api.fish.audio`
- Auth: Bearer token in Authorization header
- Key endpoints: `POST /model` (multipart), `GET /model/{id}`, `DELETE /v1/voices/{voiceId}`, `POST /v1/tts` (with `model: s2-pro` header)
- Parameter keys auto-converted camelCase → snake_case via `toSnakeCase()`

### Audio Storage (`src/lib/audio-storage.ts`)
- Files saved to `data/audio/{uuid}.{format}`
- MIME types: mp3→audio/mpeg, wav→audio/wav, opus→audio/ogg

### Frontend (`src/components/`)
- `voices/` — VoiceCard (state badge, refresh, delete dialog), VoiceList (responsive grid), VoiceUploadForm (multipart), VoicePreview (quick TTS)
- `tts/` — VoiceSelector (filters trained models), ParameterControls (speed/format/temperature), AudioPlayer (play + download), TTSForm (orchestrator)
- `history/` — HistoryItem (inline audio), HistoryList (paginated)
- `layout/` — Sidebar (nav + API key status indicator)
- `settings/` — ApiKeyForm (validate + save)

### Pages (6)
- `/` — TTS homepage (TTSForm)
- `/voices` — Voice list with auto-polling (10s for pending models)
- `/voices/new` — Upload form
- `/history` — Paginated history
- `/settings` — API key config

## Important Technical Notes

- **shadcn/ui v4 uses `@base-ui/react`** — no `asChild` prop on DialogTrigger/DialogClose. Button wrappers in dialogs must omit `asChild`.
- **shadcn/ui v4 Select `onValueChange`** signature is `(value: string | null)`, not `(value: string)`. Wrap setState calls with null guards.
- **API key stored in SQLite** — server reads it, client only knows if it exists + first 4 chars (`GET /api/settings`).
- **`better-sqlite3` is a native module** — requires `serverExternalPackages: ["better-sqlite3"]` in `next.config.ts`.
- **`data/` is gitignored** — contains SQLite DB and generated audio files. Schema is in `src/lib/db/schema.ts`.
- **Body size limit** — configured at 50mb in `next.config.ts` for audio uploads.

## Task Tracking

- Use `todo.md` for tracking development progress. Add agreed-upon tasks before coding, mark as done when completed.
- Use Task tool with sub-agents for parallel, independent work.
