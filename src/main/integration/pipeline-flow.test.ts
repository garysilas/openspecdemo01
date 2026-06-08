import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { SessionRepository } from "../storage/session-repository.js";
import { schemaSql } from "../storage/schema.js";
import { SessionJobService } from "../services/session-job-service.js";
import { ProviderError } from "../domain/providers.js";

describe("pipeline integration flow", () => {
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("processes recording through transcription, cleanup, and tts", async () => {
    const db = new Database(":memory:");
    db.exec(schemaSql);
    const repository = new SessionRepository(db);
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bdp-flow-"));
    tmpDirs.push(tmpRoot);

    const sessionId = "integration-ok";
    const rawPath = path.join(tmpRoot, "raw.wav");
    fs.writeFileSync(rawPath, "raw data", "utf8");
    const now = new Date().toISOString();
    repository.createSession({ id: sessionId, createdAt: now, status: "recorded", durationMs: 1234 });
    repository.putAudioArtifact(sessionId, "raw", rawPath, "wav");

    const job = new SessionJobService({
      repository,
      stt: { transcribe: async () => "raw transcript for integration" },
      cleanup: { polish: async () => "polished integration transcript" },
      tts: {
        synthesize: async ({ outputFilePath }) => {
          fs.writeFileSync(outputFilePath, "generated audio", "utf8");
        }
      },
      emitStatus: () => undefined
    });

    await job.processSession(sessionId);
    const session = repository.getSession(sessionId);
    expect(session?.status).toBe("complete");
    expect(session?.polishedTranscript).toContain("polished");
    expect(session?.polishedAudioPath).toBeDefined();
    expect(fs.existsSync(session!.polishedAudioPath!)).toBe(true);
  });

  it("marks failure and preserves polished transcript when tts fails", async () => {
    const db = new Database(":memory:");
    db.exec(schemaSql);
    const repository = new SessionRepository(db);
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bdp-fail-"));
    tmpDirs.push(tmpRoot);

    const sessionId = "integration-fail";
    const rawPath = path.join(tmpRoot, "raw.wav");
    fs.writeFileSync(rawPath, "raw data", "utf8");
    const now = new Date().toISOString();
    repository.createSession({ id: sessionId, createdAt: now, status: "recorded", durationMs: 1234 });
    repository.putAudioArtifact(sessionId, "raw", rawPath, "wav");

    const job = new SessionJobService({
      repository,
      stt: { transcribe: async () => "raw transcript fail case" },
      cleanup: { polish: async () => "polished still present" },
      tts: {
        synthesize: async () => {
          throw new ProviderError("TTS quota exceeded", "quota");
        }
      },
      emitStatus: () => undefined
    });

    await expect(job.processSession(sessionId)).rejects.toThrow("TTS quota exceeded");
    const session = repository.getSession(sessionId);
    expect(session?.status).toBe("failed");
    expect(session?.polishedTranscript).toBe("polished still present");
  });
});
