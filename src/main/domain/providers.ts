import type { StageErrorCode } from "../../shared/types.js";

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: StageErrorCode = "unknown"
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface SpeechToTextProvider {
  transcribe(audioFilePath: string): Promise<string>;
}

export interface CleanupProvider {
  polish(rawTranscript: string): Promise<string>;
}

export interface TextToSpeechProvider {
  synthesize(input: { text: string; outputFilePath: string }): Promise<void>;
}

export function classifyOpenAiError(error: unknown): ProviderError {
  const unknown = new ProviderError("OpenAI request failed.", "unknown");
  if (!error || typeof error !== "object") {
    return unknown;
  }
  const maybeError = error as {
    message?: string;
    status?: number;
    code?: string;
    type?: string;
    name?: string;
  };
  const message = maybeError.message ?? "OpenAI request failed.";
  if (maybeError.status === 401 || maybeError.code === "invalid_api_key") {
    return new ProviderError(message, "auth");
  }
  if (maybeError.status === 429 || maybeError.type === "rate_limit_error") {
    return new ProviderError(message, "quota");
  }
  if (maybeError.status === 400 || maybeError.status === 404 || maybeError.status === 422) {
    return new ProviderError(message, "validation");
  }
  if (
    maybeError.status === 408 ||
    maybeError.status === 409 ||
    maybeError.status === 500 ||
    maybeError.status === 502 ||
    maybeError.status === 503 ||
    maybeError.status === 504 ||
    maybeError.name === "APIConnectionError"
  ) {
    return new ProviderError(message, "transient");
  }
  return new ProviderError(message, "unknown");
}
