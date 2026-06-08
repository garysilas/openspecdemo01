## ADDED Requirements

### Requirement: Text-to-Speech Generation From Polished Text
The system SHALL generate a new spoken audio file using the polished transcript text as input to text-to-speech.

#### Scenario: Generate polished narration
- **WHEN** a session has polished text output
- **THEN** the system invokes TTS synthesis and stores a generated audio artifact for that session

### Requirement: Downloadable Audio Output
The application SHALL allow users to download or export the generated audio file to a user-selected filesystem location.

#### Scenario: User exports generated audio
- **WHEN** the user selects Download for a completed generated audio artifact
- **THEN** the app saves the file to the selected destination and confirms export completion

### Requirement: TTS Failure Handling
The system SHALL preserve polished text and session data if TTS generation fails and SHALL surface an actionable error state.

#### Scenario: TTS provider failure
- **WHEN** TTS synthesis returns an error
- **THEN** the session remains available with polished text, records TTS failure status, and offers retry capability
