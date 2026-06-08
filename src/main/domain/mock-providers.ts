import fs from "node:fs/promises";
import { CleanupProvider, ProviderError, SpeechToTextProvider, TextToSpeechProvider } from "./providers.js";

function randomDelay(min = 120, max = 320): Promise<void> {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export class MockSpeechToTextProvider implements SpeechToTextProvider {
  async transcribe(audioFilePath: string): Promise<string> {
    await randomDelay();
    if (!audioFilePath) {
      throw new ProviderError("Audio input path was not provided.", "validation");
    }
    return "um this is like a rough draft where I am kind of circling the point but the core idea is to ship a polished voice note fast";
  }
}

export class MockCleanupProvider implements CleanupProvider {
  async polish(rawTranscript: string): Promise<string> {
    await randomDelay();
    if (!rawTranscript.trim()) {
      throw new ProviderError("Transcript was empty.", "validation");
    }
    return "This is a rough draft that circles the main point: ship a polished voice note quickly.";
  }
}

export class MockTextToSpeechProvider implements TextToSpeechProvider {
  async synthesize(input: { text: string; outputFilePath: string }): Promise<void> {
    await randomDelay();
    if (input.text.length < 3) {
      throw new ProviderError("Text is too short for synthesis.", "validation");
    }
    await fs.writeFile(input.outputFilePath, `FAKE_AUDIO_DATA:${input.text}`, "utf8");
  }
}
