import React, { useEffect, useMemo, useState } from "react";
import type { AppSettings, PipelineStage, SessionListItem, SessionRecord, StageName, StageStatus } from "../../shared/types";

type RecorderMode = "idle" | "recording" | "processing";

const stageOrder: StageName[] = ["transcription", "cleanup", "tts"];

function statusLabel(status: PipelineStage): string {
  switch (status) {
    case "transcribing":
      return "Transcribing";
    case "cleaning":
      return "Cleaning text";
    case "synthesizing":
      return "Generating voice";
    case "complete":
      return "Complete";
    case "failed":
      return "Failed";
    case "recorded":
      return "Recorded";
    default:
      return "Idle";
  }
}

export function App(): React.JSX.Element {
  const [mode, setMode] = useState<RecorderMode>("idle");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [activeSession, setActiveSession] = useState<SessionRecord | undefined>(undefined);
  const [history, setHistory] = useState<SessionListItem[]>([]);
  const [error, setError] = useState<string>("");
  const [settings, setSettings] = useState<AppSettings | undefined>(undefined);
  const [settingsDraft, setSettingsDraft] = useState<AppSettings | undefined>(undefined);
  const [savedMessage, setSavedMessage] = useState<string>("");

  async function refreshHistory(): Promise<void> {
    const list = await window.desktopApi.listSessions();
    setHistory(list);
  }

  async function loadSessionDetail(id: string): Promise<void> {
    const detail = await window.desktopApi.getSessionDetail(id);
    setActiveSession(detail);
  }

  useEffect(() => {
    void refreshHistory();
    void window.desktopApi.getSettings().then((loaded) => {
      setSettings(loaded);
      setSettingsDraft(loaded);
    });
    const offStatus = window.desktopApi.onSessionStatus(async (payload) => {
      const statusPayload = payload as { sessionId?: string };
      if (statusPayload.sessionId) {
        await loadSessionDetail(statusPayload.sessionId);
      }
      await refreshHistory();
    });
    const offStage = window.desktopApi.onStageStatus(async (payload) => {
      const stagePayload = payload as { sessionId?: string };
      if (stagePayload.sessionId) {
        await loadSessionDetail(stagePayload.sessionId);
      }
    });
    return () => {
      offStatus();
      offStage();
    };
  }, []);

  const stageSummary = useMemo(() => {
    if (!activeSession) {
      return "No session selected";
    }
    const labels = stageOrder.map((stage) => {
      const match = activeSession.stageStatuses.find((s: StageStatus) => s.stage === stage);
      if (!match) {
        return `${stage}: pending`;
      }
      return `${stage}: ${match.status}`;
    });
    return labels.join(" | ");
  }, [activeSession]);

  async function startRecording(): Promise<void> {
    try {
      setError("");
      await verifyMicrophoneAccess();
      const started = await window.desktopApi.startRecording();
      setSessionId(started.sessionId);
      setMode("recording");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function stopRecording(): Promise<void> {
    try {
      setError("");
      const stopped = await window.desktopApi.stopRecording();
      setSessionId(stopped.sessionId);
      setMode("processing");
      await window.desktopApi.processSession({ sessionId: stopped.sessionId });
      await loadSessionDetail(stopped.sessionId);
      await refreshHistory();
      setMode("idle");
    } catch (err) {
      setError((err as Error).message);
      setMode("idle");
    }
  }

  async function retryStage(stage: StageName): Promise<void> {
    if (!activeSession) {
      return;
    }
    setMode("processing");
    try {
      await window.desktopApi.processSession({
        sessionId: activeSession.id,
        forceRetryStage: stage
      });
      await loadSessionDetail(activeSession.id);
      await refreshHistory();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMode("idle");
    }
  }

  async function exportAudio(): Promise<void> {
    if (!activeSession) {
      return;
    }
    try {
      const result = await window.desktopApi.exportAudio(activeSession.id);
      if (result.exported) {
        setSavedMessage(`Saved to ${result.path}`);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveSettingsPatch(): Promise<void> {
    if (!settingsDraft) {
      return;
    }
    try {
      const saved = await window.desktopApi.updateSettings(settingsDraft);
      setSettings(saved);
      setSettingsDraft(saved);
      setSavedMessage("Settings saved");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="app-shell">
      <section className="card">
        <div className="top">
          <strong>Brain Dump Polisher</strong>
          <span className={`dot ${mode === "recording" ? "recording" : ""}`} />
        </div>
        <div className="actions">
          <button className="primary" disabled={mode !== "idle"} onClick={() => void startRecording()}>
            Start
          </button>
          <button className="secondary" disabled={mode !== "recording"} onClick={() => void stopRecording()}>
            Stop
          </button>
        </div>
      </section>

      <section className="card panel">
        <h3>Session Status</h3>
        <p className="text-block">{activeSession ? `${activeSession.id} - ${statusLabel(activeSession.status)}` : "No active session yet."}</p>
        <p className="meta">{stageSummary}</p>
        {activeSession?.errorMessage ? <p className="error">{activeSession.errorMessage}</p> : null}
      </section>

      <section className="card panel">
        <h3>Transcript Results</h3>
        <p className="meta">Raw</p>
        <p className="text-block">{activeSession?.rawTranscript ?? "No raw transcript yet."}</p>
        <p className="meta">Polished</p>
        <p className="text-block">{activeSession?.polishedTranscript ?? "No polished transcript yet."}</p>
        <div className="actions">
          <button className="secondary" onClick={() => void exportAudio()} disabled={!activeSession?.polishedAudioPath}>
            Download Audio
          </button>
          <button
            className="secondary"
            onClick={() => void retryStage("tts")}
            disabled={mode === "processing" || !activeSession || activeSession.status !== "failed"}
          >
            Retry TTS
          </button>
        </div>
        {savedMessage ? <p className="meta">{savedMessage}</p> : null}
      </section>

      <section className="card panel">
        <h3>History</h3>
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} className="history-item">
              <div>
                <strong>{statusLabel(item.status)}</strong>
              </div>
              <div className="meta">{new Date(item.createdAt).toLocaleString()}</div>
              <p className="text-block">{item.transcriptPreview || "(no polished transcript yet)"}</p>
              <button className="secondary" onClick={() => void loadSessionDetail(item.id)}>
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card panel">
        <h3>Settings</h3>
        {settingsDraft ? (
          <div className="settings-grid">
            <label>
              Global Hotkey
              <input
                value={settingsDraft.hotkey}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    hotkey: event.target.value
                  })
                }
              />
            </label>
            <label>
              Retention Days
              <input
                type="number"
                min={1}
                value={settingsDraft.retentionDays}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    retentionDays: Number(event.target.value)
                  })
                }
              />
            </label>
            <label>
              STT Model
              <input
                value={settingsDraft.provider.sttModel}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    provider: {
                      ...settingsDraft.provider,
                      sttModel: event.target.value
                    }
                  })
                }
              />
            </label>
            <label>
              Cleanup Model
              <input
                value={settingsDraft.provider.llmModel}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    provider: {
                      ...settingsDraft.provider,
                      llmModel: event.target.value
                    }
                  })
                }
              />
            </label>
            <label>
              TTS Voice
              <input
                value={settingsDraft.provider.ttsVoice}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    provider: {
                      ...settingsDraft.provider,
                      ttsVoice: event.target.value
                    }
                  })
                }
              />
            </label>
            <button className="primary" onClick={() => void saveSettingsPatch()}>
              Save Settings
            </button>
          </div>
        ) : (
          <p className="meta">Loading settings...</p>
        )}
      </section>

      {error ? <p className="error">{error}</p> : null}
      {sessionId ? <p className="meta">Current session: {sessionId}</p> : null}
    </div>
  );
}

async function verifyMicrophoneAccess(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    const mediaError = error as DOMException;
    if (mediaError.name === "NotAllowedError") {
      throw new Error("Microphone permission is blocked. Allow microphone access in system settings.");
    }
    if (mediaError.name === "NotFoundError") {
      throw new Error("No microphone input device detected. Connect a microphone and try again.");
    }
    throw new Error("Unable to access microphone input. Check your audio device and permissions.");
  }
}
