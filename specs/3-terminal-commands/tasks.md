# Tasks: Unified Terminal Command Output

## Overview

**Feature**: Fix 3D terminal command output display
**Tech Stack**: React, TypeScript, Three.js
**Total Tasks**: 12
**Estimated Phases**: 4

## User Stories (from spec.md)

| Story ID | Name | Priority | Description |
|----------|------|----------|-------------|
| US1 | Command Output Display | P0 | Commands display correctly in 3D mode |
| US2 | Text Extraction | P0 | React nodes convert to readable plain text |
| US3 | Buffer Sync | P1 | Buffer stays synchronized with terminal state |
| US4 | Error Parity | P1 | Errors display consistently in both modes |

## Dependency Graph

```
Phase 1 (Investigation)
    └── Understand current extraction behavior
         ↓
Phase 2 (Text Extraction Fix)
    └── Enhance extractText utility
         ↓
Phase 3 (Buffer Sync Fix)
    └── Fix PlainLine command flag
         ↓
Phase 4 (Verification)
    └── Test all commands in 3D mode
```

---

## Phase 1: Investigation

**Goal**: Understand why commands don't display correctly in 3D mode

- [x] T001 Add console.log to extractText to see what's being extracted from HelpCommand
- [x] T002 Verify buffer contents in TerminalHandler by logging onBufferChange calls

---

## Phase 2: Text Extraction Enhancement

**Goal**: Fix extractText to properly handle all React component types

- [x] T003 [US2] Update extractText to recursively traverse all component types in src/utils/textExtraction.ts
- [x] T004 [US2] Add handling for components without string type names (custom components) in src/utils/textExtraction.ts
- [x] T005 [US2] Improve newline handling to avoid excessive blank lines in src/utils/textExtraction.ts
- [x] T006 [US2] Add table element support (table, tr, td, th) in src/utils/textExtraction.ts

---

## Phase 3: Buffer Synchronization Fix

**Goal**: Ensure buffer accurately represents terminal state

- [x] T007 [US3] Fix PlainLine.command flag in pushLine function in src/components/TerminalHandler.tsx
- [x] T008 [US3] Verify clear command properly resets plainLines state in src/components/TerminalHandler.tsx

---

## Phase 4: Verification

**Goal**: Confirm all commands work correctly in 3D mode

- [x] T009 [US1] Test help command displays all commands with descriptions in 3D mode
- [x] T010 [US1] Test projects command displays project cards readable in 3D mode
- [x] T011 [US4] Test "command not found" error displays in 3D mode
- [x] T012 [US1] Test clear command resets 3D display to prompt only

---

## Implementation Strategy

### Files to Modify

1. **src/utils/textExtraction.ts** - Main fix location
   - Handle custom components (function components)
   - Traverse children regardless of element type
   - Improve whitespace/newline handling

2. **src/components/TerminalHandler.tsx** - Minor fix
   - Fix PlainLine.command flag (line 73)

### Key Insight

The `extractText` function only handles specific HTML tags (`div`, `p`, `h1-h6`, `li`, `ul`, `ol`, `br`, `button`, `a`). Custom React components like lucide-react icons or styled components are not being traversed properly.

Current behavior for custom components:
```typescript
if (React.isValidElement(node)) {
  const children = React.Children.map(element.props.children, extractText)?.join("") ?? "";
  // ... checks for specific tags ...
  return children; // Returns children text, but icons have no text children
}
```

The fix needs to ensure that even when a component is not a known HTML tag, we still extract text from its children recursively.

---

## Completion Checklist

- [x] All 12 tasks completed
- [x] Constitution principles verified:
  - [x] Principle 1: JSDoc on modified functions
  - [x] Principle 2: Works with any command without modification
  - [x] Principle 3: Types preserved
  - [x] Principle 4: Extraction separate from rendering
  - [x] Principle 5: No style changes needed
- [x] Manual testing complete
- [x] Performance verified (< 5ms extraction)
