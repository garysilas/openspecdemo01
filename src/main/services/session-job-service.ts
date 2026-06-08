import path from "node:path";
import type { SessionRepository } from "../storage/session-repository.js";
import type { CleanupProvider, SpeechToTextProvider, TextToSpeechProvider } from "../domain/providers.js";
import { ProviderError } from "../domain/providers.js";
import type { StageErrorCode, StageName } from "../../shared/types.js";

interface SessionJobServiceDeps {
  repository: SessionRepository;
  stt: SpeechToTextProvider;
  cleanup: CleanupProvider;
  tts: TextToSpeechProvider;
  emitStatus: (event: string, payload: unknown) => void;
}

type RetryStage = StageName | undefined;

export class SessionJobService {
  constructor(private readonly deps: SessionJobServiceDeps) {}

  async processSession(sessionId: string, retryStage?: RetryStage): Promise<void> {
    const session = this.deps.repository.getSession(sessionId);
    if (!session || !session.rawAudioPath) {
      throw new Error("Session missing required raw audio.");
    }

    try {
      if (!retryStage || retryStage === "transcription") {
        await this.runStage(sessionId, "transcription", "transcribing", async () => {
          const rawTranscript = await this.deps.stt.transcribe(session.rawAudioPath!);
          this.deps.repository.putTranscript(sessionId, "raw", rawTranscript);
        });
      }

      if (!retryStage || retryStage === "cleanup" || retryStage === "transcription") {
        await this.runStage(sessionId, "cleanup", "cleaning", async () => {
          const current = this.deps.repository.getSession(sessionId);
          if (!current?.rawTranscript) {
            throw new Error("Cleanup requires a raw transcript.");
          }
          const polished = await this.deps.cleanup.polish(current.rawTranscript);
          this.deps.repository.putTranscript(sessionId, "polished", polished);
        });
      }

      if (!retryStage || retryStage === "tts" || retryStage === "cleanup" || retryStage === "transcription") {
        await this.runStage(sessionId, "tts", "synthesizing", async () => {
          const current = this.deps.repository.getSession(sessionId);
          if (!current?.polishedTranscript || !current.rawAudioPath) {
            throw new Error("TTS requires polished transcript and session path.");
          }
          const outputPath = path.join(path.dirname(current.rawAudioPath), "polished-output.wav");
          await this.deps.tts.synthesize({ text: current.polishedTranscript, outputFilePath: outputPath });
          this.deps.repository.putAudioArtifact(sessionId, "polished", outputPath, "wav");
        });
      }

      this.deps.repository.updateSessionStatus(sessionId, "complete");
      this.deps.emitStatus("session:status", { sessionId, status: "complete" });
    } catch (error) {
      const normalized = normalizeStageError(error);
      this.deps.repository.updateSessionStatus(sessionId, "failed", normalized.message);
      this.deps.emitStatus("session:status", {
        sessionId,
        status: "failed",
        error: normalized.message,
        code: normalized.code
      });
      throw error;
    }
  }

  private async runStage(
    sessionId: string,
    stage: StageName,
    status: "transcribing" | "cleaning" | "synthesizing",
    run: () => Promise<void>
  ): Promise<void> {
    this.deps.repository.updateSessionStatus(sessionId, status);
    this.deps.repository.putStageStatus(sessionId, stage, "running");
    this.deps.emitStatus("session:stage", { sessionId, stage, status: "running" });
    try {
      await run();
      this.deps.repository.putStageStatus(sessionId, stage, "done");
      this.deps.emitStatus("session:stage", { sessionId, stage, status: "done" });
    } catch (error) {
      const normalized = normalizeStageError(error);
      this.deps.repository.putStageStatus(sessionId, stage, "failed", normalized.message, normalized.code);
      this.deps.emitStatus("session:stage", {
        sessionId,
        stage,
        status: "failed",
        message: normalized.message,
        errorCode: normalized.code
      });
      throw error;
    }
  }
}

function normalizeStageError(error: unknown): { message: string; code: StageErrorCode } {
  if (error instanceof ProviderError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { message: error.message, code: "unknown" };
  }
  return { message: "Unknown failure", code: "unknown" };
}
