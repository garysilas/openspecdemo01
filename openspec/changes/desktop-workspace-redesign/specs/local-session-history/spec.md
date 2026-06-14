## MODIFIED Requirements

### Requirement: History Retrieval
The application SHALL provide a history query interface that returns prior sessions with status, transcript preview, output availability, and metadata required for desktop session browsing.

#### Scenario: Load recent sessions
- **WHEN** the user opens the history view
- **THEN** the app retrieves recent sessions from SQLite sorted by most recent timestamp with the metadata needed to render session rows

## ADDED Requirements

### Requirement: Session Selection From History
The desktop application SHALL allow the user to select a session from the history browser and load its details into the review workspace.

#### Scenario: User opens a session from history
- **WHEN** the user selects a session in the history browser
- **THEN** the application loads that session's transcript, stage status, and available actions into the review workspace

### Requirement: History Filtering and Search
The desktop application SHALL support filtering or searching the history browser using available session metadata so the list remains manageable as history grows.

#### Scenario: User filters session history
- **WHEN** the user applies a status filter or search query in the history browser
- **THEN** the application limits the visible session list to matching sessions

### Requirement: Bounded History Navigation Surface
The history browser SHALL render within an independently scrollable region that does not push unrelated workspaces such as transcript review or settings further down the page.

#### Scenario: Long session history remains contained
- **WHEN** the number of sessions exceeds the visible height of the history browser
- **THEN** the history list scrolls within its own panel and the rest of the desktop workspace remains accessible
