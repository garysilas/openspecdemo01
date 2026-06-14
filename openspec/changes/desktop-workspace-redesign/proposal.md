## Why

The current Brain Dump Polisher interface still behaves like a compact tray utility rather than a full desktop application. That makes the growing session history hard to manage, prevents a flexible transcript review workflow, and pushes settings into the same endless scroll as day-to-day recording tasks.

## What Changes

- Replace the fixed-size, non-resizable single-column window with a resizable desktop workspace shell.
- Add a left sidebar navigation model so recording, session history, review, and settings no longer compete in one vertical stack.
- Redesign session history into a bounded, searchable, independently scrollable panel with clearer status-driven navigation.
- Introduce a dedicated review workspace for comparing raw and polished transcripts, inspecting session status, retrying failed stages, and exporting polished audio.
- Move provider and application configuration into a dedicated settings view that fits the larger desktop shell.
- Refresh the renderer UI foundation so the desktop app can be composed from reusable shadcn/ui-style layout primitives and blocks instead of ad hoc stacked cards.

## Capabilities

### New Capabilities
- `desktop-workspace-shell`: A resizable desktop application shell with sidebar navigation, workspace views, and pane-based layout for recording and review workflows.
- `desktop-settings-workspace`: A dedicated settings experience for provider configuration, hotkeys, retention, and related application controls inside the desktop shell.

### Modified Capabilities
- `tray-capture-and-recording`: Recording controls move from a minimal floating recorder window toward a fuller desktop workspace while preserving tray access and hotkey-driven launch behavior.
- `local-session-history`: History behavior expands from a simple recent-session list to a navigable, scroll-bounded session browser with selection, filtering, and better session detail access.

## Impact

- Affected code: Electron window creation, renderer app structure, routing/view state, session history presentation, settings presentation, and related UI tests.
- Dependencies: shadcn/ui-compatible component setup and any supporting styling/layout primitives needed for a richer desktop renderer.
- Systems: tray lifecycle and hotkey entry points remain, but the primary operator experience shifts to a fuller desktop window and workspace layout.
