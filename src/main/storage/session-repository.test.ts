import Database from "better-sqlite3";
import { describe, expect, it, beforeEach } from "vitest";
import { SessionRepository } from "./session-repository.js";
import { schemaSql } from "./schema.js";

describe("SessionRepository", () => {
  let repository: SessionRepository;

  beforeEach(() => {
    const db = new Database(":memory:");
    db.exec(schemaSql);
    repository = new SessionRepository(db);
  });

  it("stores and retrieves transcript variants and audio paths", () => {
    const sessionId = "session-1";
    const now = new Date().toISOString();
    repository.createSession({ id: sessionId, createdAt: now, status: "recorded", durationMs: 1000 });
    repository.putTranscript(sessionId, "raw", "raw text");
    repository.putTranscript(sessionId, "polished", "polished text");
    repository.putAudioArtifact(sessionId, "raw", "/tmp/raw.wav", "wav");
    repository.putAudioArtifact(sessionId, "polished", "/tmp/polished.wav", "wav");

    const record = repository.getSession(sessionId);
    expect(record?.rawTranscript).toBe("raw text");
    expect(record?.polishedTranscript).toBe("polished text");
    expect(record?.rawAudioPath).toBe("/tmp/raw.wav");
    expect(record?.polishedAudioPath).toBe("/tmp/polished.wav");
  });

  it("returns recent sessions with polished transcript preview", () => {
    const now = new Date().toISOString();
    repository.createSession({ id: "session-a", createdAt: now, status: "recorded", durationMs: 5 });
    repository.putTranscript("session-a", "polished", "A polished transcript preview");

    const list = repository.listSessions();
    expect(list).toHaveLength(1);
    expect(list[0].transcriptPreview).toContain("polished transcript");
  });
});
