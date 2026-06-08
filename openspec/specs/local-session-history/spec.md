# Capability: Local Session History

## Purpose
TBD - define how recording sessions and artifacts are persisted and retrieved locally.

## Requirements

### Requirement: Local Session Persistence
The application SHALL persist each recording session in a local SQLite database with references to transcript and audio artifacts.

#### Scenario: Session stored after processing begins
- **WHEN** a recording is stopped and enters processing
- **THEN** the app creates a session record in SQLite with identifiers, timestamps, and current pipeline status

### Requirement: Transcript Variant Storage
The system SHALL store both raw transcript text and polished transcript text as distinct variants linked to the same session.

#### Scenario: Persist transcript variants
- **WHEN** cleanup completes for a session
- **THEN** the database stores raw and polished transcript values with explicit variant types

### Requirement: Audio Artifact Path Tracking
The system SHALL store filesystem paths and metadata for raw recording audio and generated polished audio artifacts.

#### Scenario: Save generated audio path
- **WHEN** TTS output is written to disk
- **THEN** the database records generated audio path, format, and creation timestamp for the session

### Requirement: History Retrieval
The application SHALL provide a history query interface that returns prior sessions with status, transcript preview, and output availability.

#### Scenario: Load recent sessions
- **WHEN** the user opens the history view
- **THEN** the app retrieves recent sessions from SQLite sorted by most recent timestamp
