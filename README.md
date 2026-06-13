# Brain Dump Polisher

Tray-native desktop utility that captures rough voice notes, cleans transcript text, and regenerates polished narration audio.

## Local Setup

1. Install dependencies:
   - `npm install`
2. Rebuild native SQLite binding for your runtime when needed:
   - Electron runtime: `npm run rebuild:electron`
   - Node runtime (tests/scripts): `npm run rebuild:node`
2. Start development mode:
   - `npm run dev`
3. Run quality checks:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`

## Provider Configuration

The app supports both OpenAI-backed providers and local mock providers.

### OpenAI mode (recommended)

Set environment variables (preferred precedence) or provide values in Settings UI:

- `OPENAI_API_KEY` (required when not using mocks)
- `OPENAI_STT_MODEL` (default app setting: `gpt-4o-mini-transcribe`)
- `OPENAI_CLEANUP_MODEL` (default app setting: `gpt-4.1-mini`)
- Optional: `OPENAI_USE_MOCKS=false` to force OpenAI mode

For local development, create a project-root `.env` file:

```env
OPENAI_API_KEY=sk-...
OPENAI_STT_MODEL=gpt-4o-mini-transcribe
OPENAI_CLEANUP_MODEL=gpt-4.1-mini
OPENAI_USE_MOCKS=false
```

The Electron main process now loads `.env` automatically at startup.

### Mock mode (offline/dev)

- In Settings, set **Use Mock Providers** to `Mock providers (offline/dev)`, or set `OPENAI_USE_MOCKS=true`.
- This avoids any network calls and uses deterministic fake STT/cleanup behavior.

In the UI settings panel, you can set:

- STT model name
- Cleanup model name
- TTS voice
- Global hotkey
- Retention days
- OpenAI API key
- Mock/OpenAI provider mode

Configuration precedence:
1. Environment variables (`OPENAI_*`)
2. Saved app settings

## Packaging

- macOS folder package: `npm run package:mac`
- Windows folder package: `npm run package:win`
- Linux folder package: `npm run package:linux`

## Troubleshooting

- Microphone permission denied:
  - Grant microphone permission in OS privacy settings, then retry.
- No microphone found:
  - Connect an input device and verify it is selected as the system default.
- Hotkey does not register:
  - Pick a different hotkey in settings if the current combo conflicts with another app.
- TTS/processing stage fails:
  - Use the retry button in session detail; verify provider settings and API connectivity.
- `better-sqlite3` ABI mismatch between Node/Electron:
  - For Electron dev/start: run `npm run rebuild:electron`
  - For Node-side tests: run `npm run rebuild:node`
- OpenAI auth errors (`auth`):
  - Verify `OPENAI_API_KEY` is present and valid.
- OpenAI quota errors (`quota`):
  - Check account usage/limits and retry later.
- OpenAI transient errors (`transient`):
  - Retry the failed stage; these are usually temporary network/service issues.
- Export unavailable:
  - Ensure the session reached a polished-audio output state before exporting.
