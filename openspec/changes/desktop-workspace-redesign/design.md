## Context

Brain Dump Polisher currently presents recording, session status, transcript results, history, and settings inside a single fixed-size renderer view. That compact tray-oriented layout worked for validating the core speech-to-polished flow, but it now creates product friction: history grows without bounds, transcript review competes with configuration, and the interface cannot adapt to larger desktop usage.

The underlying application architecture is already split cleanly between Electron main/preload responsibilities and a React renderer. The recording pipeline, session persistence, provider configuration, and stage status events already exist and should remain the system of record. This redesign is primarily a desktop shell and interaction-model change layered on top of those existing contracts.

Constraints:

- Preserve tray residency and hotkey-based launch so quick capture remains available.
- Do not change the transcription, cleanup, TTS, or storage pipeline as part of this redesign.
- Keep the renderer implementation compatible with the current Electron + React application structure.
- Favor composable UI primitives and reusable blocks over one-off layout code so the desktop experience can evolve.

## Goals / Non-Goals

**Goals:**

- Introduce a resizable desktop application shell that feels like a full workspace rather than a popover.
- Separate primary operator flows into clear areas for recording, session browsing, review, and settings.
- Bound history inside its own scrollable, selectable panel so it no longer pushes the rest of the UI downward.
- Preserve the existing processing pipeline contracts while improving how session state, transcripts, retries, and exports are surfaced.
- Establish a renderer layout foundation that can incorporate shadcn/ui-style sidebar, scroll, tabs, pane, and settings patterns.

**Non-Goals:**

- Replacing the tray model with a web app or permanently docked main window.
- Changing provider behavior, SQLite schema, IPC contracts, or stage ordering unless required by the UI shell.
- Redesigning the content or behavior of transcription, cleanup, or TTS stages.
- Implementing cloud sync, collaboration, or non-desktop surfaces.

## Decisions

### Decision: Shift from a floating recorder panel to a desktop workspace shell

The main window will move from a fixed compact recorder form to a larger resizable desktop shell with minimum size constraints. The tray and global hotkey remain the primary entry points, but the opened surface becomes a fuller workspace instead of a narrow floating card stack.

This is preferable to keeping the compact window and bolting on more sections because the current interaction model has already outgrown a popover. The user needs room for history navigation, transcript comparison, and settings without vertical overflow.

Alternatives considered:

- Keep the floating window and add tabs inside the current footprint: rejected because the narrow non-resizable form still limits transcript review and history usability.
- Open a second "advanced" window while preserving the old recorder window: rejected because it creates split mental models and duplicates state handling.

### Decision: Use a three-zone renderer layout

The renderer will be organized around:

- a left sidebar for navigation and session browsing,
- a central workspace for recording or transcript review,
- an optional right-side detail panel for status, metadata, retry, and export actions.

This creates independent scroll regions and allows history to behave like navigation instead of content. It also maps well to available shadcn/ui sidebar, scroll-area, resizable, tabs, and card primitives.

Alternatives considered:

- A top-tab-only layout: rejected because history still becomes secondary and harder to scan at desktop scale.
- Separate full pages with no persistent session list: rejected because switching between sessions and review actions becomes slower.

### Decision: Keep pipeline orchestration and persistence untouched; redesign the renderer around existing IPC contracts

The current Electron main process, preload bridge, session repository, and pipeline jobs already supply the core data needed by a richer UI. The redesign should consume the existing `listSessions`, `getSessionDetail`, `processSession`, `exportAudio`, and settings APIs instead of introducing new business logic into the renderer.

This minimizes risk and keeps the redesign focused on presentation, navigation, and operator workflow rather than accidental pipeline refactoring.

Alternatives considered:

- Reworking the pipeline into view-specific services: rejected because it adds architectural churn without solving the immediate UX problem.
- Moving more orchestration into the renderer: rejected because the main/preload boundaries are already appropriate for Electron.

### Decision: Make history a bounded navigation surface with selection, filtering, and search

Session history will become a dedicated scrollable list or timeline with explicit selection state. The list should support at least status-aware grouping or filtering and text search over recent sessions so growing history remains navigable.

This directly addresses the current "endless scroll into settings" problem and improves recall for prior recordings.

Alternatives considered:

- Keep history as cards in the main document flow: rejected because it recreates the current scaling problem.
- Move history to a modal only: rejected because session review is a primary workflow, not an occasional action.

### Decision: Move settings into a dedicated workspace view

Settings should live in their own navigable view within the desktop shell rather than below history. The dedicated view will continue to respect existing provider configuration and masking behavior while giving model, hotkey, and retention controls enough space to be understandable.

This reduces accidental mixing of operational setup with active recording work and gives future configuration fields a stable home.

Alternatives considered:

- Keep settings inline at the bottom of the main page: rejected because settings are not part of the primary recording flow.
- Move settings to a modal dialog: rejected because provider configuration can be long-lived, multi-field, and easier to manage in a proper page.

## Risks / Trade-offs

- [Larger desktop shell may reduce the "quick capture" feel of the original tray utility] -> Mitigation: preserve tray launch, hotkey toggle, and a recording-first default view.
- [UI redesign could sprawl into pipeline refactoring] -> Mitigation: explicitly preserve existing IPC and processing contracts unless a UI requirement proves impossible otherwise.
- [Adopting shadcn-style primitives may require renderer styling setup changes] -> Mitigation: phase the UI foundation work first and keep component adoption incremental.
- [More panes and views can increase state complexity in the renderer] -> Mitigation: centralize selected session and active view state at the app-shell level and keep stage actions routed through existing APIs.
- [Search and filter expectations may outpace current session list metadata] -> Mitigation: design initial filtering around existing fields first, then extend metadata only if necessary.

## Migration Plan

1. Expand the Electron window defaults to support a resizable desktop shell with safe minimum dimensions.
2. Introduce an app-shell renderer structure with sidebar navigation and workspace-level state.
3. Move recording controls into a primary recording workspace that remains hotkey-friendly.
4. Extract session history into a bounded navigation panel with selection and filtering support.
5. Add a dedicated review surface for raw/polished transcript comparison, status visibility, retry, and export.
6. Move settings into a dedicated settings workspace while preserving current save and masking behavior.
7. Verify end-to-end flow for record, process, review, retry, export, and history navigation.

Rollback strategy: revert to the previous single-view renderer and compact window configuration if the redesigned shell blocks core recording or processing workflows.

## Open Questions

- Should the global hotkey always open the recording workspace, or reopen the last active view?
- Is a compact "quick capture" mode still needed in addition to the new desktop shell?
- Which shadcn blocks should be adopted directly versus treated as layout inspiration only?
- Do we want session grouping by date, by status, or both in the first history redesign iteration?
