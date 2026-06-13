import fs from "node:fs";
import path from "node:path";
import electron from "electron";
import type { ProcessSessionRequest, RecordingStopPayload } from "../shared/types.js";
import { RecordingService } from "./services/recording-service.js";
import { SessionRepository } from "./storage/session-repository.js";
import { SessionJobService } from "./services/session-job-service.js";
import type { AppSettings } from "../shared/types.js";
import { loadSettings, mergeProviderPatch, sanitizeSettingsForRenderer, saveSettings, validateProviderConfig } from "./settings.js";

const { dialog, ipcMain } = electron;
type BrowserWindow = Electron.BrowserWindow;

interface IpcDeps {
  window: BrowserWindow;
  recording: RecordingService;
  repository: SessionRepository;
  jobs: SessionJobService;
  onHotkeyUpdated: (hotkey: string) => void;
}

function emitToRenderer(window: BrowserWindow, event: string, payload: unknown): void {
  if (!window.isDestroyed()) {
    window.webContents.send(event, payload);
  }
}

export function registerIpc(deps: IpcDeps): void {
  const { window, recording, repository, jobs, onHotkeyUpdated } = deps;

  ipcMain.handle("recording:start", () => {
    const started = recording.start();
    return started;
  });

  ipcMain.handle("recording:stop", async (_event, payload?: RecordingStopPayload) => {
    const stopped = payload ? recording.stopWithAudio(payload) : recording.stop();
    repository.createSession({
      id: stopped.sessionId,
      createdAt: new Date().toISOString(),
      status: "recorded",
      durationMs: stopped.durationMs
    });
    repository.putAudioArtifact(stopped.sessionId, "raw", stopped.rawAudioPath, stopped.mimeType);
    repository.updateSessionStatus(stopped.sessionId, "recorded");
    emitToRenderer(window, "session:status", {
      sessionId: stopped.sessionId,
      status: "recorded"
    });
    return stopped;
  });

  ipcMain.handle("session:process", async (_event, request: ProcessSessionRequest) => {
    recording.ensureNotRecording();
    await jobs.processSession(request.sessionId, request.forceRetryStage);
    return repository.getSession(request.sessionId);
  });

  ipcMain.handle("session:list", () => repository.listSessions());
  ipcMain.handle("session:get", (_event, sessionId: string) => repository.getSession(sessionId));

  ipcMain.handle("session:export-audio", async (_event, sessionId: string) => {
    const session = repository.getSession(sessionId);
    if (!session?.polishedAudioPath) {
      throw new Error("No polished audio available to export.");
    }
    const result = await dialog.showSaveDialog(window, {
      defaultPath: path.basename(session.polishedAudioPath)
    });
    if (result.canceled || !result.filePath) {
      return { exported: false };
    }
    fs.copyFileSync(session.polishedAudioPath, result.filePath);
    return { exported: true, path: result.filePath };
  });

  ipcMain.handle("settings:get", () => sanitizeSettingsForRenderer(loadSettings()));
  ipcMain.handle("settings:update", (_event, patch: Partial<AppSettings>) => {
    const current = loadSettings();
    const mergedProvider = mergeProviderPatch(current.provider, patch.provider);
    const next = {
      ...current,
      ...patch,
      provider: mergedProvider
    };
    if (patch.hotkey && patch.hotkey !== current.hotkey) {
      onHotkeyUpdated(patch.hotkey);
    }
    validateProviderConfig(next.provider);
    const saved = saveSettings(next);
    return sanitizeSettingsForRenderer(saved);
  });
}
