import fs from "node:fs";
import path from "node:path";
import electron from "electron";
import { DEFAULT_HOTKEY } from "./constants.js";
import type { AppSettings } from "../shared/types.js";

const { app } = electron;

const SETTINGS_FILE = "settings.json";

const defaultSettings: AppSettings = {
  hotkey: DEFAULT_HOTKEY,
  retentionDays: 30,
  provider: {
    sttModel: "gpt-4o-mini-transcribe",
    llmModel: "gpt-4.1-mini",
    ttsVoice: "alloy",
    useMocks: true
  }
};

function settingsPath(): string {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

export function loadSettings(): AppSettings {
  const file = settingsPath();
  if (!fs.existsSync(file)) {
    return defaultSettings;
  }
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<AppSettings>;
  return {
    ...defaultSettings,
    ...parsed,
    provider: {
      ...defaultSettings.provider,
      ...parsed.provider
    }
  };
}

export function saveSettings(next: AppSettings): AppSettings {
  const file = settingsPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function sanitizeSettingsForRenderer(settings: AppSettings): AppSettings {
  return {
    ...settings,
    provider: {
      ...settings.provider,
      apiKey: undefined
    }
  };
}

export function resolveProviderConfig(settings: AppSettings): AppSettings["provider"] {
  const envApiKey = process.env.OPENAI_API_KEY?.trim();
  const envSttModel = process.env.OPENAI_STT_MODEL?.trim();
  const envLlmModel = process.env.OPENAI_CLEANUP_MODEL?.trim();
  const envUseMocks = process.env.OPENAI_USE_MOCKS?.trim().toLowerCase();
  const resolvedUseMocks =
    envUseMocks === "1" || envUseMocks === "true"
      ? true
      : envUseMocks === "0" || envUseMocks === "false"
        ? false
        : settings.provider.useMocks ?? true;
  return {
    ...settings.provider,
    sttModel: envSttModel || settings.provider.sttModel,
    llmModel: envLlmModel || settings.provider.llmModel,
    apiKey: envApiKey || settings.provider.apiKey,
    useMocks: resolvedUseMocks
  };
}

export function formatProviderDebugInfo(provider: AppSettings["provider"]): string {
  const key = provider.apiKey ?? "";
  const masked =
    key.length >= 8 ? `${key.slice(0, 6)}...${key.slice(-4)} (len:${key.length})` : key ? "***" : "<missing>";
  return `useMocks=${provider.useMocks !== false} sttModel=${provider.sttModel} cleanupModel=${provider.llmModel} apiKey=${masked}`;
}

export function validateProviderConfig(provider: AppSettings["provider"]): void {
  if (provider.useMocks) {
    return;
  }
  if (!provider.apiKey) {
    throw new Error("OpenAI is enabled but API key is missing. Set OPENAI_API_KEY or add it in settings.");
  }
  if (!provider.sttModel) {
    throw new Error("OpenAI STT model is missing. Set OPENAI_STT_MODEL or provider STT model in settings.");
  }
  if (!provider.llmModel) {
    throw new Error("OpenAI cleanup model is missing. Set OPENAI_CLEANUP_MODEL or provider cleanup model in settings.");
  }
}

export function mergeProviderPatch(
  current: AppSettings["provider"],
  patchProvider: Partial<AppSettings["provider"]> | undefined
): AppSettings["provider"] {
  const merged: AppSettings["provider"] = {
    ...current,
    ...(patchProvider ?? {})
  };
  if (patchProvider && patchProvider.apiKey === undefined) {
    merged.apiKey = current.apiKey;
  }
  if (patchProvider && typeof patchProvider.apiKey === "string" && patchProvider.apiKey.trim() === "") {
    merged.apiKey = undefined;
  }
  return merged;
}
