## ADDED Requirements

### Requirement: Speech Transcription Stage
The system SHALL transcribe each recorded audio session into raw text before cleanup processing begins.

#### Scenario: Successful transcription
- **WHEN** a recorded audio session is submitted for processing
- **THEN** the system produces a raw transcript artifact linked to the session

### Requirement: Transcript Cleanup Stage
The system SHALL send raw transcript text to an LLM cleanup stage that removes filler words and improves grammar while preserving user intent.

#### Scenario: Cleanup produces polished text
- **WHEN** raw transcript text is available for a session
- **THEN** the system returns polished text output and associates it with that session

### Requirement: Ordered Stage Execution
The system SHALL execute processing stages in order: transcription first, cleanup second, and SHALL not skip required predecessor stages.

#### Scenario: Cleanup blocked until transcript exists
- **WHEN** cleanup is requested for a session that has no completed transcript
- **THEN** the system prevents cleanup execution and reports the missing prerequisite

### Requirement: Pipeline Status Visibility
The system SHALL expose per-session processing status so the UI can display stage progress and terminal outcomes.

#### Scenario: UI receives stage transitions
- **WHEN** a session advances from transcription to cleanup
- **THEN** the system emits status updates that identify current stage and outcome
