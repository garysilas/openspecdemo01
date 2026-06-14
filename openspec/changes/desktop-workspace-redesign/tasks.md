## 1. Desktop Shell Foundation

- [ ] 1.1 Update Electron window configuration to support a larger resizable desktop workspace with safe minimum dimensions
- [ ] 1.2 Introduce a renderer app-shell structure with sidebar navigation and workspace-level view state
- [ ] 1.3 Add the UI foundation needed for composable desktop layout primitives and shared shell styling

## 2. Recording and Review Workspace

- [ ] 2.1 Move recording controls into a dedicated recording workspace within the desktop shell
- [ ] 2.2 Build a multi-pane session review layout that shows transcript content, session status, and session actions together
- [ ] 2.3 Preserve existing retry and export actions inside the redesigned review workspace

## 3. History Navigation Redesign

- [ ] 3.1 Replace the inline history section with a bounded session browser that has independent scrolling
- [ ] 3.2 Implement session selection behavior that loads the chosen session into the review workspace
- [ ] 3.3 Add initial history filtering and search behavior using available session metadata

## 4. Settings Workspace

- [ ] 4.1 Move application and provider settings into a dedicated settings workspace view
- [ ] 4.2 Preserve current settings loading, masking, save, and validation feedback behavior in the new layout
- [ ] 4.3 Ensure navigation between recording, history/review, and settings remains consistent within one desktop window

## 5. Verification and Regression Coverage

- [ ] 5.1 Update renderer and integration tests for navigation, session selection, and desktop recording workflows
- [ ] 5.2 Verify history remains bounded and independently scrollable with long session lists and long transcript content
- [ ] 5.3 Run regression checks for recording, processing, retry, export, settings save, and desktop shell behavior
