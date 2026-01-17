# Implementation Plan: Unified Terminal Command Output

## Constitution Check

Before implementation, verify alignment with principles:

| Principle | Approach |
|-----------|----------|
| Documentation | JSDoc comments on extractText utility enhancements and buffer management functions |
| Extensibility | Text extraction handles any React component tree; new commands work automatically |
| Type Safety | PlainLine interface, BufferChangeCallback type already defined in TerminalHandler |
| Separation | Command logic → React output → extractText → plain text buffer → canvas render |
| Style | Terminal green theme, monospace fonts, consistent with existing UI |

## Problem Analysis

After investigating the codebase, the architecture is:

1. **TerminalHandler.tsx** (lines 64-87): `pushLine()` extracts text from React nodes
2. **textExtraction.ts** (lines 7-62): `extractText()` converts React trees to strings
3. **TerminalScene.tsx** (lines 14-136): `useTerminalTexture()` renders text to canvas

**Current Flow:**
```
Command.run() → ReactNode → pushLine() → extractText() → plainLines state → onBufferChange callback → buffer prop → useTerminalTexture → Canvas
```

**Identified Issues:**
1. `extractText` doesn't handle custom components like `HelpCircle`, `Terminal`, `ChevronRight` (lucide-react icons)
2. These components have no text content and are being skipped silently
3. The `command` flag in PlainLine is incorrectly set (line 73: only first line marked as command)
4. Block element handling may create excessive newlines

## Implementation Steps

### Phase 1: Investigate & Test Current Behavior

- [ ] Create test script to verify extractText with HelpCommand output
- [ ] Document which components/elements are not being extracted
- [ ] Verify buffer contents in 3D mode with console logging

### Phase 2: Enhance Text Extraction

- [ ] Update `extractText` to handle custom React components (traverse children regardless of type)
- [ ] Add handling for lucide-react icons (skip icons but continue to children)
- [ ] Improve whitespace handling to avoid excessive newlines
- [ ] Add handling for table elements (`<table>`, `<tr>`, `<td>`)

### Phase 3: Fix Buffer Synchronization

- [ ] Review `pushLine` logic for multi-line output handling
- [ ] Fix PlainLine.command flag to only mark actual command prompts
- [ ] Ensure clear command properly resets buffer
- [ ] Add debug logging option for buffer state (removable later)

### Phase 4: Verify All Commands

- [ ] Test `help` command in 3D mode
- [ ] Test `aboutme` command in 3D mode
- [ ] Test `projects` command in 3D mode
- [ ] Test `cv` command in 3D mode
- [ ] Test `skills` command in 3D mode
- [ ] Test error messages ("command not found")
- [ ] Test `clear` command

### Phase 5: Clean Up

- [ ] Remove debug logging
- [ ] Add JSDoc comments to enhanced functions
- [ ] Verify performance (< 5ms extraction overhead)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| src/utils/textExtraction.ts | Modify | Enhance extractText to handle custom components |
| src/components/TerminalHandler.tsx | Modify | Fix PlainLine.command flag logic |

## Key Code Changes

### textExtraction.ts

Current issue: Custom components (like lucide icons) return empty strings because:
```typescript
if (React.isValidElement(node)) {
  // Only handles specific HTML tags, custom components fall through
  return children; // If component has no string children, returns ""
}
```

Fix approach:
```typescript
// Always recursively extract children, even from custom components
// Skip icons (components without meaningful text children)
// Continue traversing the tree regardless of component type
```

### TerminalHandler.tsx (pushLine)

Current issue (line 73):
```typescript
...split.map((t, idx) => ({ text: t, command: idx === 0 })),
```

The first line of EVERY command output is marked as `command: true`, but it should only be the actual command prompt line, not the first line of output.

Fix: The prompt line is added separately in the buffer effect (line 495), not in pushLine. So pushLine should mark all output lines as `command: false`.

## Testing Strategy

- [ ] Manual verification: Run each command in 3D terminal, compare to 2D output
- [ ] Visual comparison: Text on CRT should match 2D terminal content
- [ ] Performance check: Use DevTools to measure extraction time
- [ ] Edge cases: Empty output, very long output, nested components

## Rollback Plan

1. The changes are isolated to `textExtraction.ts` and `pushLine` in `TerminalHandler.tsx`
2. Git revert on these two files restores previous behavior
3. 2D terminal remains unaffected by these changes (uses React nodes directly)

## Success Criteria

1. `help` command shows all command names and descriptions in 3D mode
2. Multi-line output from `cat` displays correctly with line breaks
3. Error messages are readable in 3D mode
4. `clear` resets the 3D display to just the prompt
5. All existing 2D terminal functionality unchanged
