## Why

People often have useful ideas but struggle to express them clearly in real time; spoken drafts are usually full of filler words, repeated thoughts, and rough grammar. This change creates a fast "brain dump to polished output" flow so users can capture raw thoughts and immediately get professional-grade text and narration for practical reuse.

## What Changes

- Build a desktop tray utility with a global hotkey that opens a minimal floating recorder window.
- Add microphone recording controls (start/stop), upload/transcription pipeline, and polished-text output panel.
- Integrate an LLM cleanup stage that rewrites raw transcripts for clarity, grammar, and concision while preserving intended meaning.
- Add text-to-speech generation for cleaned text and provide downloadable regenerated audio output.
- Store local history of sessions in SQLite, including transcript variants and generated audio file paths.
- Implement a premium desktop UI using Electron + React + TypeScript + CSS + ShadCN-style components.

## Capabilities

### New Capabilities

- `tray-capture-and-recording`: System tray app lifecycle, global hotkey behavior, and floating recorder window interactions.
- `speech-to-polished-pipeline`: End-to-end transcription, LLM cleanup, and polished text presentation.
- `regenerated-voice-output`: Text-to-speech rendering of cleaned transcript and downloadable audio asset handling.
- `local-session-history`: SQLite-backed storage and retrieval of transcript/audio session history and metadata.

### Modified Capabilities

- None.

## Impact

- Affected code: new Electron desktop app modules (main process, renderer UI, IPC bridge, audio pipeline services, persistence layer).
- Dependencies: Electron, React, TypeScript, SQLite driver/ORM, speech-to-text provider SDK, LLM provider SDK, text-to-speech provider SDK.
- Systems: local filesystem for temporary and exported audio files; local SQLite database for history.
- APIs: new internal IPC contracts for recording controls, pipeline execution, and history retrieval.
