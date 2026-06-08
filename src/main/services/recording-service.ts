import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sessionsDir } from "../constants.js";

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
    const rawAudioPath = path.join(directory, "raw-input.wav");
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
    fs.writeFileSync(this.active.rawAudioPath, "FAKE_WAV_DATA", "utf8");
    const result: RecordingStopped = {
      sessionId: this.active.sessionId,
      durationMs,
      rawAudioPath: this.active.rawAudioPath
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
