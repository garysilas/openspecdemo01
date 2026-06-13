import { OpenAiCleanupProvider, OpenAiSpeechToTextProvider } from "./openai-providers.js";
import { MockCleanupProvider, MockSpeechToTextProvider, MockTextToSpeechProvider } from "./mock-providers.js";
import type { CleanupProvider, SpeechToTextProvider, TextToSpeechProvider } from "./providers.js";
import type { AppSettings } from "../../shared/types.js";
import { validateProviderConfig } from "../settings.js";

export interface RuntimeProviders {
  stt: SpeechToTextProvider;
  cleanup: CleanupProvider;
  tts: TextToSpeechProvider;
}

export function createRuntimeProviders(provider: AppSettings["provider"]): RuntimeProviders {
  const tts = new MockTextToSpeechProvider();
  if (provider.useMocks) {
    return {
      stt: new MockSpeechToTextProvider(),
      cleanup: new MockCleanupProvider(),
      tts
    };
  }

  validateProviderConfig(provider);
  return {
    stt: new OpenAiSpeechToTextProvider({
      apiKey: provider.apiKey!,
      sttModel: provider.sttModel,
      llmModel: provider.llmModel
    }),
    cleanup: new OpenAiCleanupProvider({
      apiKey: provider.apiKey!,
      sttModel: provider.sttModel,
      llmModel: provider.llmModel
    }),
    tts
  };
}
