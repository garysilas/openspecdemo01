## 1. Project Bootstrap and Desktop Shell

- [x] 1.1 Scaffold Electron + React + TypeScript app structure with main, preload, and renderer processes
- [x] 1.2 Add core dependencies and tooling (Electron, React, TypeScript, styling stack, SQLite client, build scripts)
- [x] 1.3 Implement system tray lifecycle and default launch behavior without opening a full main window
- [x] 1.4 Implement configurable global hotkey registration and toggle behavior for floating recorder window

## 2. Recorder Window and Capture Flow

- [x] 2.1 Build minimal floating recorder UI with clear idle/recording/processing state indicators
- [x] 2.2 Implement microphone capture start/stop pipeline and persist raw recording files to session workspace
- [x] 2.3 Wire renderer-to-main IPC contracts for recording controls and session lifecycle events
- [x] 2.4 Add validation and user-facing errors for microphone permissions and unavailable input devices

## 3. AI Processing Pipeline (STT -> Cleanup -> TTS)

- [x] 3.1 Create provider interface layer for transcription, transcript cleanup, and text-to-speech services
- [x] 3.2 Implement sequential job orchestration that enforces stage order and records stage transitions
- [x] 3.3 Integrate transcription stage to generate and persist raw transcript artifacts
- [x] 3.4 Integrate cleanup stage to generate polished transcript text while preserving intent
- [x] 3.5 Integrate TTS stage to generate polished audio output from cleaned transcript text
- [x] 3.6 Implement retry-safe failure handling for stage errors with actionable status reporting

## 4. Local Persistence and History

- [x] 4.1 Design and apply SQLite schema for sessions, transcript variants, and audio artifact metadata
- [x] 4.2 Implement repository layer for creating/updating sessions and storing raw/polished transcript variants
- [x] 4.3 Persist raw and generated audio filesystem paths with timestamps, formats, and status metadata
- [x] 4.4 Implement history query APIs returning recent sessions with status, transcript preview, and output availability

## 5. Results UX and Export

- [x] 5.1 Build results view showing raw transcript, polished transcript, current pipeline status, and errors
- [x] 5.2 Implement download/export flow for generated audio to user-selected filesystem destinations
- [x] 5.3 Add session detail view with retry actions for failed stages (especially TTS failures)
- [x] 5.4 Add settings UI for provider configuration, hotkey customization, and future retention controls

## 6. Quality, Packaging, and Release Readiness

- [x] 6.1 Add unit tests for pipeline orchestration, repository operations, and provider error classification
- [x] 6.2 Add integration/e2e coverage for hotkey->record->process->export happy path and key failure paths
- [x] 6.3 Validate desktop packaging and startup behavior across target OS builds for tray and hotkey features
- [x] 6.4 Document local setup, required API keys, and troubleshooting for audio/input/provider failures
