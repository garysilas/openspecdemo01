## RENAMED Requirements

- FROM: `Minimal Floating Recorder Controls`
- TO: `Desktop Recording Controls`

## MODIFIED Requirements

### Requirement: Global Hotkey Toggle
The application SHALL support a configurable global hotkey that toggles visibility and focus of the desktop workspace window.

#### Scenario: Hotkey opens recorder
- **WHEN** the user presses the configured global hotkey while the desktop workspace window is hidden
- **THEN** the application shows the desktop workspace window in the foreground and readies microphone capture controls

#### Scenario: Hotkey hides recorder
- **WHEN** the user presses the configured global hotkey while the desktop workspace window is visible
- **THEN** the application hides the desktop workspace window and keeps tray services active

### Requirement: Desktop Recording Controls
The desktop workspace SHALL provide start and stop recording controls with clear state feedback in the primary recording view.

#### Scenario: Recording starts from desktop workspace
- **WHEN** the user clicks Start in the desktop recording view
- **THEN** the app begins microphone capture and displays a recording-in-progress indicator

#### Scenario: Recording stops from desktop workspace
- **WHEN** the user clicks Stop in the desktop recording view
- **THEN** the app ends microphone capture and transitions the session into processing state
