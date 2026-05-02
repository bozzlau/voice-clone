/**
 * Fish Audio API Client
 *
 * REST API client for Fish Audio voice cloning and text-to-speech.
 * Base URL: https://api.fish.audio
 * Auth: Bearer token
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface VoiceFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface CreateModelParams {
  title: string;
  description?: string;
  visibility?: "public" | "unlist" | "private";
  type: "tts";
  trainMode: "fast";
  voices: VoiceFile[];
  texts?: string[];
  tags?: string[];
  enhanceAudioQuality?: boolean;
  coverImage?: Buffer;
}

export interface GenerateTTSParams {
  text: string;
  referenceId?: string;
  format?: string;
  temperature?: number;
  topP?: number;
  prosody?: {
    speed?: number;
    volume?: number;
    normalizeLoudness?: boolean;
  };
  chunkLength?: number;
  normalize?: boolean;
  sampleRate?: number;
  mp3Bitrate?: number;
  latency?: string;
  maxNewTokens?: number;
  repetitionPenalty?: number;
  minChunkLength?: number;
  conditionOnPreviousChunks?: boolean;
  earlyStopThreshold?: number;
}

/* ------------------------------------------------------------------ */
/*  Client                                                             */
/* ------------------------------------------------------------------ */

export class FishAudioClient {
  private apiKey: string;
  private baseUrl = "https://api.fish.audio";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Core request helper.
   * - Constructs the URL and auth header.
   * - For JSON bodies, serialises and sets Content-Type.
   * - For FormData bodies, lets fetch derive Content-Type (with boundary).
   * - Throws on non-2xx responses with a descriptive message.
   */
  private async request(
    method: string,
    path: string,
    options?: {
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
      formData?: FormData;
    },
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Only set Content-Type for JSON payloads.
    // When formData is present, let fetch set the multipart boundary.
    if (options?.body && !options?.formData) {
      headers["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.formData) {
      fetchOptions.body = options.formData;
    } else if (options?.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorBody = await response.json();
        errorMessage =
          errorBody.message ??
          errorBody.detail ??
          errorBody.error ??
          JSON.stringify(errorBody);
      } catch {
        errorMessage = await response.text().catch(() => "Unknown error");
      }
      throw new Error(
        `Fish Audio API error (${response.status}): ${errorMessage}`,
      );
    }

    return response;
  }

  /* ------------------------------------------------------------------ */
  /*  Model management                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Create a new voice-clone model.
   * POST /model  (multipart/form-data)
   *
   * The returned object contains an `id` field that identifies the model.
   */
  async createModel(
    params: CreateModelParams,
  ): Promise<{ id: string; [key: string]: unknown }> {
    const formData = new FormData();

    // -- required scalar fields
    formData.append("title", params.title);
    formData.append("type", params.type);
    formData.append("train_mode", params.trainMode);

    // -- optional scalar fields
    if (params.description !== undefined) {
      formData.append("description", params.description);
    }
    if (params.visibility !== undefined) {
      formData.append("visibility", params.visibility);
    }
    if (params.enhanceAudioQuality !== undefined) {
      formData.append(
        "enhance_audio_quality",
        params.enhanceAudioQuality ? "true" : "false",
      );
    }

    // -- string arrays (each value appended with the same key)
    if (params.texts !== undefined) {
      for (const text of params.texts) {
        formData.append("texts", text);
      }
    }
    if (params.tags !== undefined) {
      for (const tag of params.tags) {
        formData.append("tags", tag);
      }
    }

    // -- voice files
    for (const voice of params.voices) {
      formData.append(
        "voices",
        new Blob([voice.buffer as BlobPart], { type: voice.contentType }),
        voice.filename,
      );
    }

    // -- optional cover image
    if (params.coverImage) {
      formData.append(
        "cover_image",
        new Blob([params.coverImage as BlobPart]),
        "cover_image.jpg",
      );
    }

    const response = await this.request("POST", "/model", { formData });
    return response.json() as Promise<{
      id: string;
      [key: string]: unknown;
    }>;
  }

  /**
   * Get a single model by ID.
   * GET /model/{id}
   *
   * The response includes a `state` field indicating the training status.
   */
  async getModel(
    id: string,
  ): Promise<{ _id: string; state: string; [key: string]: unknown }> {
    const response = await this.request(
      "GET",
      `/model/${encodeURIComponent(id)}`,
    );
    return response.json() as Promise<{
      _id: string;
      state: string;
      [key: string]: unknown;
    }>;
  }

  /**
   * List all models for the authenticated user.
   * GET /model
   */
  async listModels(): Promise<unknown[]> {
    const response = await this.request("GET", "/model");
    return response.json() as Promise<unknown[]>;
  }

  /**
   * Delete a voice model.
   * DELETE /v1/voices/{voiceId}
   */
  async deleteModel(voiceId: string): Promise<{ message: string }> {
    const response = await this.request(
      "DELETE",
      `/v1/voices/${encodeURIComponent(voiceId)}`,
    );
    return response.json() as Promise<{ message: string }>;
  }

  /* ------------------------------------------------------------------ */
  /*  Text-to-Speech                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Generate speech from text.
   * POST /v1/tts
   *
   * Returns the raw fetch Response so the caller can consume the audio
   * stream (chunked transfer encoding). The caller is responsible for
   * handling the binary audio format specified in the request.
   *
   * The `model: s2-pro` header is automatically included.
   */
  async generateTTS(params: GenerateTTSParams): Promise<Response> {
    const body = this.toSnakeCase(params as unknown as Record<string, unknown>);

    return this.request("POST", "/v1/tts", {
      body,
      headers: {
        model: "s2-pro",
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Health / validation                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Verify that the configured API key is valid by calling a lightweight
   * endpoint (GET /model). Returns a structured result instead of throwing.
   */
  async validateApiKey(): Promise<{ valid: boolean; message: string }> {
    try {
      await this.request("GET", "/model");
      return { valid: true, message: "API key is valid" };
    } catch (error) {
      return {
        valid: false,
        message:
          error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Recursively converts all object keys from camelCase to snake_case.
   * Arrays and primitive values are passed through unchanged.
   * Undefined values are omitted from the result.
   */
  private toSnakeCase(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;

      const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        result[snakeKey] = this.toSnakeCase(
          value as Record<string, unknown>,
        );
      } else {
        result[snakeKey] = value;
      }
    }

    return result;
  }
}
