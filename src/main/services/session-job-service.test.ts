import { describe, expect, it } from "vitest";
import { SessionJobService } from "./session-job-service.js";
import { ProviderError, type CleanupProvider, type SpeechToTextProvider, type TextToSpeechProvider } from "../domain/providers.js";

class InMemoryRepository {
  private sessions = new Map<
    string,
    {
      rawAudioPath?: string;
      rawTranscript?: string;
      polishedTranscript?: string;
      status: string;
      stage: Array<{ stage: string; status: string; errorCode?: string }>;
      polishedAudioPath?: string;
      errorMessage?: string;
    }
  >();

  seed(sessionId: string): void {
    this.sessions.set(sessionId, {
      rawAudioPath: `/tmp/${sessionId}/raw.wav`,
      status: "recorded",
      stage: []
    });
  }

  getSession(sessionId: string) {
    const item = this.sessions.get(sessionId);
    if (!item) {
      return undefined;
    }
    return {
      id: sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: item.status as any,
      durationMs: 1,
      rawAudioPath: item.rawAudioPath,
      polishedAudioPath: item.polishedAudioPath,
      rawTranscript: item.rawTranscript,
      polishedTranscript: item.polishedTranscript,
      stageStatuses: [],
      errorMessage: item.errorMessage
    };
  }

  putTranscript(sessionId: string, variant: "raw" | "polished", content: string): void {
    const item = this.sessions.get(sessionId)!;
    if (variant === "raw") {
      item.rawTranscript = content;
    } else {
      item.polishedTranscript = content;
    }
  }

  putAudioArtifact(sessionId: string, _kind: "raw" | "polished", filePath: string): void {
    this.sessions.get(sessionId)!.polishedAudioPath = filePath;
  }

  updateSessionStatus(sessionId: string, status: any, errorMessage?: string): void {
    const item = this.sessions.get(sessionId)!;
    item.status = status;
    item.errorMessage = errorMessage;
  }

  putStageStatus(sessionId: string, stage: any, status: any, _message?: string, errorCode?: any): void {
    this.sessions.get(sessionId)!.stage.push({ stage, status, errorCode });
  }
}

describe("SessionJobService", () => {
  it("runs all stages in order and marks session complete", async () => {
    const repo = new InMemoryRepository();
    repo.seed("s1");
    const events: string[] = [];
    const service = new SessionJobService({
      repository: repo as any,
      stt: { transcribe: async () => "raw transcript" } satisfies SpeechToTextProvider,
      cleanup: { polish: async () => "polished transcript" } satisfies CleanupProvider,
      tts: { synthesize: async () => undefined } satisfies TextToSpeechProvider,
      emitStatus: (event) => events.push(event)
    });

    await service.processSession("s1");

    expect(repo.getSession("s1")?.status).toBe("complete");
    expect(events).toContain("session:stage");
    expect(events).toContain("session:status");
  });

  it("classifies provider failures as failed stage states", async () => {
    const repo = new InMemoryRepository();
    repo.seed("s2");
    const service = new SessionJobService({
      repository: repo as any,
      stt: {
        transcribe: async () => {
          throw new ProviderError("Auth fail", "auth");
        }
      } satisfies SpeechToTextProvider,
      cleanup: { polish: async () => "unused" } satisfies CleanupProvider,
      tts: { synthesize: async () => undefined } satisfies TextToSpeechProvider,
      emitStatus: () => undefined
    });

    await expect(service.processSession("s2")).rejects.toThrow("Auth fail");
    expect(repo.getSession("s2")?.status).toBe("failed");
  });
});
