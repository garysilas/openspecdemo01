/// <reference types="vite/client" />

import type { AppSettings, ProcessSessionRequest, RecordingStopPayload, SessionListItem, SessionRecord } from "../shared/types";

declare global {
  interface Window {
    desktopApi: {
      startRecording: () => Promise<{ sessionId: string }>;
      stopRecording: (payload: RecordingStopPayload) => Promise<{ sessionId: string; durationMs: number; rawAudioPath: string }>;
      processSession: (request: ProcessSessionRequest) => Promise<SessionRecord | undefined>;
      listSessions: () => Promise<SessionListItem[]>;
      getSessionDetail: (sessionId: string) => Promise<SessionRecord | undefined>;
      exportAudio: (sessionId: string) => Promise<{ exported: boolean; path?: string }>;
      getSettings: () => Promise<AppSettings>;
      updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
      onSessionStatus: (handler: (payload: unknown) => void) => () => void;
      onStageStatus: (handler: (payload: unknown) => void) => () => void;
    };
  }
}

export {};
