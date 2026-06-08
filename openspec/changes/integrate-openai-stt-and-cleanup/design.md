## Context

The current pipeline uses mock providers for transcription and text cleanup, which means the app flow works but output quality and failure behavior are not production-realistic. This change upgrades the `speech-to-polished-pipeline` capability to use OpenAI APIs for STT and rewrite cleanup while preserving existing stage ordering, status events, and retry behavior.

## Goals / Non-Goals

**Goals:**
- Replace mock STT with an OpenAI transcription adapter that accepts recorded audio files.
- Replace mock cleanup with an OpenAI rewrite adapter that returns polished transcript text.
- Keep existing pipeline stage orchestration and UI status semantics stable.
- Add provider configuration/validation for OpenAI API key and model names.
- Map OpenAI/API failures to existing normalized provider error classes.

**Non-Goals:**
- Replacing TTS provider in this change.
- Adding multi-provider routing or fallback orchestration.
- Building cloud-side credential vaulting; credentials remain local app config.
- Changing session data model beyond fields required to identify provider/model usage.

## Decisions

### Decision: Add dedicated OpenAI provider adapters behind existing interfaces
- Implement `OpenAiSpeechToTextProvider` for transcription and `OpenAiCleanupProvider` for rewrite cleanup.
- Keep `SpeechToTextProvider` and `CleanupProvider` interfaces unchanged so job orchestration does not need structural rewrites.
- Rationale: isolates vendor SDK details and minimizes disruption to tested orchestration logic.
- Alternative considered: embedding OpenAI API calls directly in `SessionJobService`; rejected due to tighter coupling and harder testing.

### Decision: Keep mocks as optional fallback for local/dev safety
- Retain mock providers for tests and no-key local runs, but default runtime path uses OpenAI when API key/config are present.
- Rationale: preserves fast deterministic tests and easier development bootstrapping.
- Alternative considered: removing mocks entirely; rejected because tests become network-coupled and brittle.

### Decision: Centralized OpenAI config validation at startup and settings updates
- Validate `OPENAI_API_KEY` (or equivalent settings field) and required model names before provider initialization.
- Surface clear user-facing errors for missing/invalid config, and avoid silent fallback that hides misconfiguration.
- Rationale: predictable startup behavior and faster troubleshooting.

### Decision: Normalize OpenAI error surfaces to existing provider error codes
- Map OpenAI auth/rate limit/validation/network errors to existing codes (`auth`, `quota`, `validation`, `transient`, `unknown`).
- Keep pipeline retry semantics unchanged (retry from failed stage).
- Rationale: avoids UI churn while improving production observability.

## Risks / Trade-offs

- [External API latency increases stage duration] -> Mitigation: keep stage status updates granular and preserve non-blocking UI progress states.
- [Misconfigured API key breaks processing flow] -> Mitigation: explicit startup/settings validation and actionable error messages.
- [Provider SDK/API changes over time] -> Mitigation: isolate provider adapters and add contract tests around normalized responses/errors.
- [Network failures can produce partial session outputs] -> Mitigation: preserve current stage checkpointing and retry-from-stage behavior.

## Migration Plan

1. Add OpenAI SDK dependency and provider config fields for STT/cleanup model IDs.
2. Implement OpenAI STT and cleanup adapters with strict interface parity.
3. Add error normalization helpers for OpenAI response/error shapes.
4. Wire provider selection in bootstrap to prefer OpenAI adapters when config is valid.
5. Update tests to include OpenAI-adapter success and error classification scenarios.
6. Verify end-to-end flow (record -> transcribe -> cleanup) and regression checks for history/status behavior.

Rollback strategy: keep mock provider path available behind config guard so runtime can revert to mock mode if OpenAI integration causes critical regressions.

## Open Questions

- Which OpenAI model IDs should be defaulted for STT and cleanup in settings?
- Should API key be sourced only from environment variables, only from settings, or merged precedence?
- Do we want to persist model IDs per session for observability/audit in this change or a follow-up?
