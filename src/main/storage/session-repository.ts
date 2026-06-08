import type Database from "better-sqlite3";
import type { PipelineStage, SessionListItem, SessionRecord, StageErrorCode, StageName, StageStatus } from "../../shared/types.js";

interface StageRow {
  stage: StageName;
  status: StageStatus["status"];
  message: string | null;
  error_code: StageErrorCode | null;
  updated_at: string;
}

export class SessionRepository {
  constructor(private readonly db: Database.Database) {}

  createSession(input: { id: string; createdAt: string; status: PipelineStage; durationMs: number }): void {
    this.db
      .prepare(
        "INSERT INTO sessions (id, created_at, updated_at, status, duration_ms) VALUES (?, ?, ?, ?, ?)"
      )
      .run(input.id, input.createdAt, input.createdAt, input.status, input.durationMs);
  }

  updateSessionStatus(id: string, status: PipelineStage, errorMessage?: string): void {
    this.db
      .prepare("UPDATE sessions SET status = ?, error_message = ?, updated_at = ? WHERE id = ?")
      .run(status, errorMessage ?? null, new Date().toISOString(), id);
  }

  putTranscript(sessionId: string, variant: "raw" | "polished", content: string): void {
    this.db
      .prepare(
        "INSERT INTO transcripts (session_id, variant, content, created_at) VALUES (?, ?, ?, ?) " +
          "ON CONFLICT(session_id, variant) DO UPDATE SET content = excluded.content, created_at = excluded.created_at"
      )
      .run(sessionId, variant, content, new Date().toISOString());
  }

  putAudioArtifact(sessionId: string, kind: "raw" | "polished", filePath: string, format: string): void {
    this.db
      .prepare(
        "INSERT INTO audio_artifacts (session_id, kind, file_path, format, created_at) VALUES (?, ?, ?, ?, ?) " +
          "ON CONFLICT(session_id, kind) DO UPDATE SET file_path = excluded.file_path, format = excluded.format, created_at = excluded.created_at"
      )
      .run(sessionId, kind, filePath, format, new Date().toISOString());
  }

  putStageStatus(sessionId: string, stage: StageName, status: StageStatus["status"], message?: string, errorCode?: StageErrorCode): void {
    this.db
      .prepare(
        "INSERT INTO stage_statuses (session_id, stage, status, message, error_code, updated_at) VALUES (?, ?, ?, ?, ?, ?) " +
          "ON CONFLICT(session_id, stage) DO UPDATE SET status = excluded.status, message = excluded.message, error_code = excluded.error_code, updated_at = excluded.updated_at"
      )
      .run(sessionId, stage, status, message ?? null, errorCode ?? null, new Date().toISOString());
  }

  listSessions(limit = 50): SessionListItem[] {
    const rows = this.db
      .prepare(
        `SELECT s.id, s.created_at, s.status,
                COALESCE(substr(t.content, 1, 120), '') as transcript_preview,
                CASE WHEN a.file_path IS NULL THEN 0 ELSE 1 END as has_polished_audio
         FROM sessions s
         LEFT JOIN transcripts t ON t.session_id = s.id AND t.variant = 'polished'
         LEFT JOIN audio_artifacts a ON a.session_id = s.id AND a.kind = 'polished'
         ORDER BY s.created_at DESC
         LIMIT ?`
      )
      .all(limit) as Array<{
      id: string;
      created_at: string;
      status: PipelineStage;
      transcript_preview: string;
      has_polished_audio: number;
    }>;
    return rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      transcriptPreview: row.transcript_preview,
      hasPolishedAudio: Boolean(row.has_polished_audio)
    }));
  }

  getSession(id: string): SessionRecord | undefined {
    const session = this.db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .get(id) as
      | {
          id: string;
          created_at: string;
          updated_at: string;
          status: PipelineStage;
          duration_ms: number;
          error_message: string | null;
        }
      | undefined;
    if (!session) {
      return undefined;
    }
    const transcriptRows = this.db
      .prepare("SELECT variant, content FROM transcripts WHERE session_id = ?")
      .all(id) as Array<{ variant: "raw" | "polished"; content: string }>;
    const audioRows = this.db
      .prepare("SELECT kind, file_path FROM audio_artifacts WHERE session_id = ?")
      .all(id) as Array<{ kind: "raw" | "polished"; file_path: string }>;
    const stageRows = this.db
      .prepare("SELECT stage, status, message, error_code, updated_at FROM stage_statuses WHERE session_id = ? ORDER BY id ASC")
      .all(id) as StageRow[];
    const rawTranscript = transcriptRows.find((t) => t.variant === "raw")?.content;
    const polishedTranscript = transcriptRows.find((t) => t.variant === "polished")?.content;
    const rawAudioPath = audioRows.find((a) => a.kind === "raw")?.file_path;
    const polishedAudioPath = audioRows.find((a) => a.kind === "polished")?.file_path;
    return {
      id: session.id,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      status: session.status,
      durationMs: session.duration_ms,
      errorMessage: session.error_message ?? undefined,
      rawTranscript,
      polishedTranscript,
      rawAudioPath,
      polishedAudioPath,
      stageStatuses: stageRows.map((row) => ({
        stage: row.stage,
        status: row.status,
        message: row.message ?? undefined,
        errorCode: row.error_code ?? undefined,
        updatedAt: row.updated_at
      }))
    };
  }
}
