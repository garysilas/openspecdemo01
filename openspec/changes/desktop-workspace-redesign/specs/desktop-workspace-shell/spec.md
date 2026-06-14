## ADDED Requirements

### Requirement: Resizable Desktop Workspace Window
The desktop application SHALL open a resizable main window sized for multi-pane desktop workflows.

#### Scenario: User resizes the desktop window
- **WHEN** the user resizes the desktop application window
- **THEN** the layout reflows without hiding the primary recording, navigation, or review controls

### Requirement: Sidebar Workspace Navigation
The desktop renderer SHALL provide sidebar navigation for primary views including recording, session review, and settings.

#### Scenario: User switches workspace views
- **WHEN** the user selects a destination from the sidebar
- **THEN** the application activates the corresponding workspace view inside the same desktop window

### Requirement: Multi-Pane Session Workspace
The desktop shell SHALL support distinct navigation, content, and detail regions so operators can browse sessions while reviewing transcripts and actions.

#### Scenario: User reviews a selected session
- **WHEN** the user selects a session from the session browser
- **THEN** the application displays that session's transcript content, processing status, and available actions in dedicated workspace regions

### Requirement: Independent Scroll Regions
The desktop shell SHALL maintain independently scrollable regions for long history lists and long transcript content.

#### Scenario: Long content remains bounded to its region
- **WHEN** a session history list or transcript exceeds the visible height of its panel
- **THEN** only that panel scrolls and the surrounding workspace layout remains stable
