## 1. Dependency and Configuration Foundation

- [x] 1.1 Add OpenAI SDK dependency and any required typing/runtime support to package configuration
- [x] 1.2 Extend provider settings model to include OpenAI API key and STT/cleanup model identifiers
- [x] 1.3 Implement startup/settings validation for required OpenAI configuration with clear actionable errors
- [x] 1.4 Define configuration precedence rules (env vs saved settings) and wire them into provider initialization

## 2. OpenAI Provider Adapters

- [x] 2.1 Implement `OpenAiSpeechToTextProvider` that transcribes local audio files through OpenAI STT APIs
- [x] 2.2 Implement `OpenAiCleanupProvider` that rewrites raw transcripts through an OpenAI text model
- [x] 2.3 Add adapter-level request/response shaping that preserves existing pipeline interface contracts
- [x] 2.4 Add secure key handling boundaries so API credentials are not leaked into renderer state/events

## 3. Error Normalization and Pipeline Wiring

- [x] 3.1 Implement OpenAI error classification mapping into normalized provider error codes (`auth`, `quota`, `validation`, `transient`, `unknown`)
- [x] 3.2 Update pipeline wiring to select OpenAI adapters by default when configuration is valid
- [x] 3.3 Preserve existing stage order and retry-from-failed-stage behavior with OpenAI-backed providers
- [x] 3.4 Ensure stage status events include actionable messages for OpenAI-originated failures

## 4. Tests and Verification

- [x] 4.1 Add unit tests for OpenAI STT adapter success and validation failure scenarios
- [x] 4.2 Add unit tests for OpenAI cleanup adapter success and API error classification scenarios
- [x] 4.3 Update orchestration tests to verify normalized error mapping and unchanged retry semantics
- [x] 4.4 Run regression checks (`typecheck`, `test`, `build`) to confirm no behavior regressions outside provider swap

## 5. Documentation and Operator Guidance

- [x] 5.1 Update README/setup docs with required OpenAI configuration fields and example values
- [x] 5.2 Document common OpenAI failure modes (auth, quota, transient network) and recommended recovery steps
- [x] 5.3 Document how to switch between mock and OpenAI providers for local development/testing
