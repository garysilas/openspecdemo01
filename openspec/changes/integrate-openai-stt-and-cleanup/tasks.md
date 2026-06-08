## 1. Dependency and Configuration Foundation

- [ ] 1.1 Add OpenAI SDK dependency and any required typing/runtime support to package configuration
- [ ] 1.2 Extend provider settings model to include OpenAI API key and STT/cleanup model identifiers
- [ ] 1.3 Implement startup/settings validation for required OpenAI configuration with clear actionable errors
- [ ] 1.4 Define configuration precedence rules (env vs saved settings) and wire them into provider initialization

## 2. OpenAI Provider Adapters

- [ ] 2.1 Implement `OpenAiSpeechToTextProvider` that transcribes local audio files through OpenAI STT APIs
- [ ] 2.2 Implement `OpenAiCleanupProvider` that rewrites raw transcripts through an OpenAI text model
- [ ] 2.3 Add adapter-level request/response shaping that preserves existing pipeline interface contracts
- [ ] 2.4 Add secure key handling boundaries so API credentials are not leaked into renderer state/events

## 3. Error Normalization and Pipeline Wiring

- [ ] 3.1 Implement OpenAI error classification mapping into normalized provider error codes (`auth`, `quota`, `validation`, `transient`, `unknown`)
- [ ] 3.2 Update pipeline wiring to select OpenAI adapters by default when configuration is valid
- [ ] 3.3 Preserve existing stage order and retry-from-failed-stage behavior with OpenAI-backed providers
- [ ] 3.4 Ensure stage status events include actionable messages for OpenAI-originated failures

## 4. Tests and Verification

- [ ] 4.1 Add unit tests for OpenAI STT adapter success and validation failure scenarios
- [ ] 4.2 Add unit tests for OpenAI cleanup adapter success and API error classification scenarios
- [ ] 4.3 Update orchestration tests to verify normalized error mapping and unchanged retry semantics
- [ ] 4.4 Run regression checks (`typecheck`, `test`, `build`) to confirm no behavior regressions outside provider swap

## 5. Documentation and Operator Guidance

- [ ] 5.1 Update README/setup docs with required OpenAI configuration fields and example values
- [ ] 5.2 Document common OpenAI failure modes (auth, quota, transient network) and recommended recovery steps
- [ ] 5.3 Document how to switch between mock and OpenAI providers for local development/testing
