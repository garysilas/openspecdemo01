## ADDED Requirements

### Requirement: Tray-Resident App Lifecycle
The application SHALL run as a system tray utility and remain available without requiring a persistent full-size main window.

#### Scenario: App starts into tray mode
- **WHEN** the user launches the application
- **THEN** the app initializes a tray icon and background process without opening a full desktop window by default

### Requirement: Global Hotkey Toggle
The application SHALL support a configurable global hotkey that toggles visibility and focus of the floating recorder window.

#### Scenario: Hotkey opens recorder
- **WHEN** the user presses the configured global hotkey while the recorder window is hidden
- **THEN** the application shows the floating recorder window in the foreground and readies microphone capture controls

#### Scenario: Hotkey hides recorder
- **WHEN** the user presses the configured global hotkey while the recorder window is visible
- **THEN** the application hides the floating recorder window and keeps tray services active

### Requirement: Minimal Floating Recorder Controls
The floating window SHALL provide start and stop recording controls with clear state feedback.

#### Scenario: Recording starts from floating window
- **WHEN** the user clicks Start in the floating recorder window
- **THEN** the app begins microphone capture and displays a recording-in-progress indicator

#### Scenario: Recording stops from floating window
- **WHEN** the user clicks Stop in the floating recorder window
- **THEN** the app ends microphone capture and transitions the session into processing state
