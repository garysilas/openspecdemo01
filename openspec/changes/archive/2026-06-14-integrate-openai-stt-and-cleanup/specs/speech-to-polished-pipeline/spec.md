## MODIFIED Requirements

### Requirement: Speech Transcription Stage
The system SHALL transcribe each recorded audio session into raw text using a configured OpenAI speech-to-text model before cleanup processing begins.

#### Scenario: Successful OpenAI transcription
- **WHEN** a recorded audio session is submitted for processing and OpenAI STT configuration is valid
- **THEN** the system sends the audio to OpenAI STT and stores the returned raw transcript artifact linked to the session

#### Scenario: Missing STT configuration
- **WHEN** transcription is requested and required OpenAI STT configuration is missing
- **THEN** the system fails the transcription stage with a validation-class error and does not run cleanup

### Requirement: Transcript Cleanup Stage
The system SHALL send raw transcript text to a configured OpenAI text model that rewrites for clarity, removes filler words, and improves grammar while preserving user intent.

#### Scenario: Cleanup produces polished text via OpenAI
- **WHEN** raw transcript text is available for a session and OpenAI cleanup configuration is valid
- **THEN** the system sends the transcript to OpenAI and stores polished text output for that session

#### Scenario: OpenAI cleanup failure classification
- **WHEN** OpenAI cleanup returns an API error
- **THEN** the system classifies the failure into a normalized provider error type and records the stage as failed

## ADDED Requirements

### Requirement: OpenAI Provider Error Normalization
The system SHALL map OpenAI API and transport failures for transcription and cleanup into normalized provider error codes used by pipeline status and retry flows.

#### Scenario: Authentication failure mapping
- **WHEN** OpenAI returns an authentication error for transcription or cleanup
- **THEN** the system records the stage failure with error code `auth` and includes an actionable message

#### Scenario: Rate limit failure mapping
- **WHEN** OpenAI returns a rate-limit error for transcription or cleanup
- **THEN** the system records the stage failure with error code `quota` and keeps the session retryable
