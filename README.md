# Brain Dump Polisher

Tray-native desktop utility that captures rough voice notes, cleans transcript text, and regenerates polished narration audio.

## Local Setup

1. Install dependencies:
   - `npm install`
2. Start development mode:
   - `npm run dev`
3. Run quality checks:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`

## Provider Configuration

The app currently uses mock providers by default for STT, cleanup, and TTS stages. In the UI settings panel, you can set:

- STT model name
- Cleanup model name
- TTS voice
- Global hotkey
- Retention days

When real providers are wired in, use these fields plus API key support to map to SDK clients.

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
- Export unavailable:
  - Ensure the session reached a polished-audio output state before exporting.
