import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sessionsDir } from "../constants.js";
import type { RecordingStopPayload } from "../../shared/types.js";

interface ActiveRecording {
  sessionId: string;
  startedAt: number;
  directory: string;
  rawAudioPath: string;
}

export interface RecordingStopped {
  sessionId: string;
  durationMs: number;
  rawAudioPath: string;
  mimeType: string;
}

export class RecordingService {
  private active?: ActiveRecording;

  start(): { sessionId: string } {
    if (this.active) {
      throw new Error("A recording is already in progress.");
    }
    const sessionId = randomUUID();
    const directory = path.join(sessionsDir(), sessionId);
    fs.mkdirSync(directory, { recursive: true });
    const rawAudioPath = path.join(directory, "raw-input.webm");
    this.active = {
      sessionId,
      startedAt: Date.now(),
      directory,
      rawAudioPath
    };
    return { sessionId };
  }

  stop(): RecordingStopped {
    if (!this.active) {
      throw new Error("No active recording found.");
    }
    const durationMs = Date.now() - this.active.startedAt;
    fs.writeFileSync(this.active.rawAudioPath, "");
    const result: RecordingStopped = {
      sessionId: this.active.sessionId,
      durationMs,
      rawAudioPath: this.active.rawAudioPath,
      mimeType: "audio/webm"
    };
    this.active = undefined;
    return result;
  }

  stopWithAudio(payload: RecordingStopPayload): RecordingStopped {
    if (!this.active) {
      throw new Error("No active recording found.");
    }
    if (!payload.base64Audio) {
      throw new Error("Audio payload is empty.");
    }
    const durationMs = Date.now() - this.active.startedAt;
    const ext = payload.fileExtension || "webm";
    const rawAudioPath = path.join(this.active.directory, `raw-input.${ext}`);
    const bytes = Buffer.from(payload.base64Audio, "base64");
    fs.writeFileSync(rawAudioPath, bytes);
    const result: RecordingStopped = {
      sessionId: this.active.sessionId,
      durationMs,
      rawAudioPath,
      mimeType: payload.mimeType || "audio/webm"
    };
    this.active = undefined;
    return result;
  }

  ensureNotRecording(): void {
    if (this.active) {
      throw new Error("Cannot process while recording is still active.");
    }
  }
}
