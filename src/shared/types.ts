export type PipelineStage =
  | "idle"
  | "recorded"
  | "transcribing"
  | "cleaning"
  | "synthesizing"
  | "complete"
  | "failed";

export type StageName = "transcription" | "cleanup" | "tts";

export type StageErrorCode =
  | "auth"
  | "quota"
  | "transient"
  | "validation"
  | "unknown";

export interface StageStatus {
  stage: StageName;
  status: "pending" | "running" | "done" | "failed";
  message?: string;
  errorCode?: StageErrorCode;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: PipelineStage;
  durationMs: number;
  rawTranscript?: string;
  polishedTranscript?: string;
  rawAudioPath?: string;
  polishedAudioPath?: string;
  errorMessage?: string;
  stageStatuses: StageStatus[];
}

export interface SessionListItem {
  id: string;
  createdAt: string;
  status: PipelineStage;
  transcriptPreview: string;
  hasPolishedAudio: boolean;
}

export interface ProviderConfig {
  sttModel: string;
  llmModel: string;
  ttsVoice: string;
  apiKey?: string;
}

export interface AppSettings {
  hotkey: string;
  retentionDays: number;
  provider: ProviderConfig;
}

export interface ProcessSessionRequest {
  sessionId: string;
  forceRetryStage?: StageName;
}
