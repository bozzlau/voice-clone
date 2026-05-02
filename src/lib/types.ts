export interface VoiceModel {
  id: number;
  name: string;
  description: string;
  fishModelId: string;
  state: "created" | "training" | "trained" | "failed";
  trainMode: string | null;
  visibility: string | null;
  audioSamples: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TTSHistoryItem {
  id: number;
  voiceModelId: number | null;
  voiceModelName: string;
  inputText: string;
  audioFormat: string;
  parameters: Record<string, unknown>;
  audioFilePath: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FishModelResponse {
  id: string;
  _id?: string;
  title?: string;
  state?: string;
  [key: string]: unknown;
}

export interface ApiKeyStatus {
  exists: boolean;
  prefix: string | null;
}
