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
    sttModel: "mock-stt-v1",
    llmModel: "mock-cleanup-v1",
    ttsVoice: "alloy"
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
