import { contextBridge, ipcRenderer } from "electron";
import type { AppSettings, ProcessSessionRequest, RecordingStopPayload, SessionListItem, SessionRecord } from "../shared/types.js";

const api = {
  startRecording: (): Promise<{ sessionId: string }> => ipcRenderer.invoke("recording:start"),
  stopRecording: (payload: RecordingStopPayload): Promise<{ sessionId: string; durationMs: number; rawAudioPath: string }> =>
    ipcRenderer.invoke("recording:stop", payload),
  processSession: (request: ProcessSessionRequest): Promise<SessionRecord | undefined> =>
    ipcRenderer.invoke("session:process", request),
  listSessions: (): Promise<SessionListItem[]> => ipcRenderer.invoke("session:list"),
  getSessionDetail: (sessionId: string): Promise<SessionRecord | undefined> =>
    ipcRenderer.invoke("session:get", sessionId),
  exportAudio: (sessionId: string): Promise<{ exported: boolean; path?: string }> =>
    ipcRenderer.invoke("session:export-audio", sessionId),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke("settings:get"),
  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke("settings:update", patch),
  onSessionStatus: (handler: (payload: unknown) => void): (() => void) => {
    const listener = (_event: unknown, payload: unknown): void => handler(payload);
    ipcRenderer.on("session:status", listener);
    return () => ipcRenderer.removeListener("session:status", listener);
  },
  onStageStatus: (handler: (payload: unknown) => void): (() => void) => {
    const listener = (_event: unknown, payload: unknown): void => handler(payload);
    ipcRenderer.on("session:stage", listener);
    return () => ipcRenderer.removeListener("session:stage", listener);
  }
};

contextBridge.exposeInMainWorld("desktopApi", api);
