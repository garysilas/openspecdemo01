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
