import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type OpenAI from "openai";
import { OpenAiCleanupProvider, OpenAiSpeechToTextProvider } from "./openai-providers.js";

function makeStubClient() {
  return {
    audio: {
      transcriptions: {
        create: async () => ({ text: "transcribed text" })
      }
    },
    responses: {
      create: async () => ({ output_text: "cleaned transcript" })
    }
  } as unknown as OpenAI;
}

describe("OpenAI providers", () => {
  it("transcribes audio with OpenAI STT client", async () => {
    const tmpPath = path.join(os.tmpdir(), `openai-stt-${Date.now()}.wav`);
    fs.writeFileSync(tmpPath, "fake-wav-data", "utf8");
    const provider = new OpenAiSpeechToTextProvider(
      { apiKey: "k", sttModel: "gpt-4o-mini-transcribe", llmModel: "gpt-4.1-mini" },
      makeStubClient()
    );
    const out = await provider.transcribe(tmpPath);
    expect(out).toBe("transcribed text");
    fs.rmSync(tmpPath, { force: true });
  });

  it("rewrites transcript with OpenAI cleanup client", async () => {
    const provider = new OpenAiCleanupProvider(
      { apiKey: "k", sttModel: "gpt-4o-mini-transcribe", llmModel: "gpt-4.1-mini" },
      makeStubClient()
    );
    const out = await provider.polish("this is messy raw text");
    expect(out).toContain("cleaned");
  });
});
