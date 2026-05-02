import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const voiceModels = sqliteTable("voice_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default(""),
  fishModelId: text("fish_model_id").notNull().unique(),
  state: text("state", { enum: ["created", "training", "trained", "failed"] })
    .notNull()
    .default("created"),
  trainMode: text("train_mode").default("fast"),
  visibility: text("visibility", { enum: ["public", "unlist", "private"] }).default("private"),
  audioSamples: text("audio_samples", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const ttsHistory = sqliteTable("tts_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voiceModelId: integer("voice_model_id").references(() => voiceModels.id, { onDelete: "set null" }),
  voiceModelName: text("voice_model_name").notNull(),
  inputText: text("input_text").notNull(),
  audioFormat: text("audio_format").notNull().default("mp3"),
  parameters: text("parameters", { mode: "json" }).$type<Record<string, unknown>>().default({}),
  audioFilePath: text("audio_file_path").notNull(),
  createdAt: text("created_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});
