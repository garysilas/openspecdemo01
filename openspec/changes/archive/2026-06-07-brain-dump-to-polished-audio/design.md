## Context

The change introduces a new desktop-first workflow: users trigger a global hotkey, record free-form speech, and receive both polished text and regenerated speech audio. The app must feel lightweight (tray-resident, minimal floating window) while orchestrating a multi-stage AI pipeline (STT -> LLM cleanup -> TTS). It also needs reliable local persistence for session history without cloud databases, making SQLite the default storage layer. The architecture must balance responsiveness, security of local files/API keys, and recoverability when external AI providers fail.

## Goals / Non-Goals

**Goals:**
- Provide a tray-based Electron app with a global hotkey that opens a compact recorder UI.
- Support microphone recording and deterministic transition into processing states.
- Produce two user-facing outputs per session: cleaned transcript text and downloadable regenerated audio.
- Persist session history locally with searchable metadata and file path references.
- Establish a modular provider abstraction for STT, LLM cleanup, and TTS to allow provider swaps without UI rewrites.

**Non-Goals:**
- Real-time streaming transcription during recording.
- Multi-user sync, cloud storage, or remote account features.
- DAW-level audio editing, effects, or timeline manipulation.
- Advanced workflow automation (batch jobs, scheduled processing) in the first version.

## Decisions

### Decision: Electron multi-process architecture with explicit IPC contracts
- The main process owns tray lifecycle, global hotkeys, native window control, file access, and DB access.
- The renderer process owns UI state and interaction flows.
- A preload bridge exposes a minimal typed IPC API (`startRecording`, `stopRecording`, `processSession`, `listSessions`, `getSessionDetail`, `exportAudio`).
- Rationale: keeps native privileges out of renderer, improves security, and makes feature boundaries testable.
- Alternative considered: single-process browser-focused app with web APIs; rejected because it cannot provide robust tray/global-hotkey behavior across desktop environments.

### Decision: Pipeline orchestration in main process job service
- After recording stops, a job service runs sequential stages: transcribe audio, clean transcript, synthesize polished audio.
- Each stage emits progress events to renderer and writes intermediate artifacts to an app-managed workspace.
- Rationale: centralizes retries/timeouts and ensures the UI remains responsive even for long-running provider calls.
- Alternative considered: running provider calls in renderer; rejected due to key exposure risk and brittle lifecycle behavior when windows are hidden/reloaded.

### Decision: SQLite as single local source of truth
- Use a local SQLite DB with tables for sessions, transcript variants, and output artifacts.
- Persist absolute file paths, duration, provider metadata, status, and timestamps.
- Rationale: zero external infrastructure, good reliability, and straightforward query support for history views.
- Alternative considered: JSON files only; rejected because indexed history queries and state transitions become error-prone at scale.

### Decision: Filesystem workspace for audio artifacts with retention policy hooks
- Store raw recordings and generated audio under an app data directory (`sessions/<sessionId>/`).
- Track paths in SQLite and expose controlled export actions.
- Rationale: predictable cleanup and robust path management across restarts.
- Alternative considered: storing blobs directly inside SQLite; rejected to avoid DB bloat and slower backup/migration operations.

### Decision: Provider abstraction and fallback-ready error model
- Define interfaces for STT/LLM/TTS adapters with normalized request/response contracts and classified errors (auth, quota, transient, validation).
- Surface user-safe errors in UI and keep verbose diagnostics in logs.
- Rationale: reduces vendor lock-in and prevents provider-specific edge cases from leaking into core UI logic.
- Alternative considered: hard-coding one provider SDK end-to-end; rejected because future provider changes would require broad refactors.

## Risks / Trade-offs

- [External API latency can make processing feel slow] -> Mitigation: show stage-based progress and allow users to revisit completed sessions while jobs run.
- [Provider failures may leave partial artifacts] -> Mitigation: persist stage status per session and support safe retry from the failed stage.
- [Global hotkey conflicts with OS/app shortcuts] -> Mitigation: allow user-configurable hotkey and validate collisions on assignment.
- [Audio files can accumulate and consume disk space] -> Mitigation: add retention settings and periodic cleanup hooks tied to DB metadata.
- [Local key/config misconfiguration can break the pipeline] -> Mitigation: startup validation and explicit settings diagnostics before first run.

## Migration Plan

1. Scaffold Electron + React + TypeScript project structure with main/renderer/preload separation.
2. Add tray + hotkey + floating window shell and verify platform startup behavior.
3. Implement recording subsystem and local filesystem session workspace.
4. Add SQLite schema/migrations and persistence repositories.
5. Integrate STT, cleanup LLM, and TTS adapters behind provider interfaces.
6. Build renderer UI states for recording, processing, results, and history.
7. Add retry/error handling and artifact export behavior.
8. Execute end-to-end tests and package for desktop distribution.

Rollback strategy: ship changes behind an application-level feature flag for early builds; if critical instability appears, disable pipeline execution and keep tray shell active while fixes are applied.

## Open Questions

- Which default providers should be configured first for STT, LLM cleanup, and TTS?
- Should cleaned text be editable before TTS generation, or should v1 always synthesize immediately from auto-cleaned output?
- What is the default retention period for raw/generated audio files?
- Do we require offline-only fallback behavior (degraded mode) when provider APIs are unavailable?
