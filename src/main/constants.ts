import path from "node:path";
import electron from "electron";

const { app } = electron;

export const APP_NAME = "Brain Dump Polisher";
export const DEFAULT_HOTKEY = "CommandOrControl+Shift+Space";

export function appDataDir(): string {
  return path.join(app.getPath("userData"), "data");
}

export function sessionsDir(): string {
  return path.join(appDataDir(), "sessions");
}

export function dbPath(): string {
  return path.join(appDataDir(), "sessions.sqlite");
}
