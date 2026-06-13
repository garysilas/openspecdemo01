import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { classifyOpenAiError, CleanupProvider, ProviderError, SpeechToTextProvider } from "./providers.js";

interface OpenAiProviderConfig {
  apiKey: string;
  sttModel: string;
  llmModel: string;
}

function parseCleanupText(response: OpenAI.Responses.Response): string {
  const direct = response.output_text?.trim();
  if (direct) {
    return direct;
  }
  for (const item of response.output ?? []) {
    if (item.type !== "message") {
      continue;
    }
    for (const content of item.content) {
      if (content.type === "output_text") {
        const text = content.text.trim();
        if (text) {
          return text;
        }
      }
    }
  }
  throw new ProviderError("OpenAI cleanup returned an empty response.", "validation");
}

export class OpenAiSpeechToTextProvider implements SpeechToTextProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly config: OpenAiProviderConfig,
    client?: OpenAI
  ) {
    this.client = client ?? new OpenAI({ apiKey: config.apiKey });
  }

  async transcribe(audioFilePath: string): Promise<string> {
    if (!audioFilePath) {
      throw new ProviderError("Audio input path was not provided.", "validation");
    }
    try {
      const file = await fs.readFile(audioFilePath);
      const ext = path.extname(audioFilePath).toLowerCase();
      const inferredMime =
        ext === ".wav"
          ? "audio/wav"
          : ext === ".mp3"
            ? "audio/mpeg"
            : ext === ".m4a"
              ? "audio/mp4"
              : "audio/webm";
      const audio = await toFile(file, `recording${ext || ".webm"}`, { type: inferredMime });
      const result = await this.client.audio.transcriptions.create({
        model: this.config.sttModel,
        response_format: "text",
        file: audio
      });
      const maybeResult = result as unknown as { text?: string } | string;
      const text =
        typeof maybeResult === "string"
          ? maybeResult.trim()
          : typeof maybeResult.text === "string"
            ? maybeResult.text.trim()
            : "";
      if (!text) {
        throw new ProviderError("OpenAI transcription returned empty text.", "validation");
      }
      return text;
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw classifyOpenAiError(error);
    }
  }
}

export class OpenAiCleanupProvider implements CleanupProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly config: OpenAiProviderConfig,
    client?: OpenAI
  ) {
    this.client = client ?? new OpenAI({ apiKey: config.apiKey });
  }

  async polish(rawTranscript: string): Promise<string> {
    if (!rawTranscript.trim()) {
      throw new ProviderError("Transcript was empty.", "validation");
    }
    try {
      const response = await this.client.responses.create({
        model: this.config.llmModel,
        instructions:
          "Rewrite the transcript into clean, professional prose. Remove filler words and false starts while preserving intent and meaning.",
        input: rawTranscript
      });
      return parseCleanupText(response);
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      throw classifyOpenAiError(error);
    }
  }
}
