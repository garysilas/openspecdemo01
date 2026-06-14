## ADDED Requirements

### Requirement: Dedicated Settings Workspace
The application SHALL provide a dedicated settings workspace inside the desktop shell rather than placing settings inline with recording and history content.

#### Scenario: User opens settings from navigation
- **WHEN** the user selects Settings from the desktop navigation
- **THEN** the application displays a dedicated settings workspace in the main window

### Requirement: Provider and Application Configuration Form
The settings workspace SHALL expose editable controls for provider configuration and application preferences including API key, model identifiers, hotkey, retention, and provider mode.

#### Scenario: User views current configuration
- **WHEN** the settings workspace loads
- **THEN** the application populates the form with the current saved settings and preserves sensitive-field masking behavior where applicable

### Requirement: Settings Save Feedback
The settings workspace SHALL provide explicit feedback for successful saves and validation failures.

#### Scenario: User saves updated settings
- **WHEN** the user submits valid settings changes
- **THEN** the application confirms that the settings were saved without requiring the user to leave the workspace
