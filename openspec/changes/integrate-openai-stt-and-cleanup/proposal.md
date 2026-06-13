# Why

The app currently relies on mock providers, so transcript quality and cleanup behavior are not representative of production output. Integrating OpenAI-powered speech-to-text and rewrite cleanup now enables real end-to-end quality, validates provider configuration flow, and makes the core workflow actually useful for users.

## What Changes

- Replace mock STT implementation with an OpenAI STT adapter that transcribes recorded audio files.
- Replace mock cleanup implementation with an OpenAI text rewrite adapter that removes filler words, improves grammar, and preserves intent.
- Extend provider configuration and startup validation to require an OpenAI API key and model identifiers for STT and cleanup.
- Add provider error mapping for OpenAI API failures (auth, quota, transient, validation) so UI status/retry behavior stays actionable.
- Update tests to cover successful OpenAI adapter integration and failure-path classification behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `speech-to-polished-pipeline`: Transcription and cleanup stages change from mock processing to OpenAI API-backed processing with real provider errors and outputs.

## Impact

- Affected code: provider adapter layer, pipeline orchestration, settings/config validation, and tests.
- Dependencies: OpenAI Node SDK (or compatible HTTP client) and secure API key handling.
- APIs/systems: outbound calls to OpenAI speech-to-text and text-generation endpoints; local app config now must include OpenAI credentials.
