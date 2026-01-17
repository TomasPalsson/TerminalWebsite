# Feature Specification: Unified Terminal Command Output

## Overview

**Goal:** Fix the 3D terminal's command output handling to properly display command results while maintaining a single source of truth for command execution across both 2D (HTML) and 3D (canvas texture) terminal modes.

**Constitution Alignment:**
- [x] Principle 1 (Documentation): Output format contracts documented
- [x] Principle 2 (Extensibility): Commands work in any terminal mode without modification
- [x] Principle 3 (Type Safety): Output types explicitly defined for both modes
- [x] Principle 4 (Separation): Command logic separate from rendering mode
- [x] Principle 5 (Style): Consistent output formatting across both modes

## Requirements

### Functional Requirements

1. **Single Command Source**: All terminal commands execute through one unified system
   - The `commandMap` remains the single source of truth for available commands
   - Command execution logic is shared between 2D and 3D modes
   - No command duplication between terminal implementations

2. **Dual Output Format**: Commands produce output consumable by both terminal modes
   - 2D Terminal: React nodes with rich formatting (colors, links, structure)
   - 3D Terminal: Plain text strings for canvas texture rendering
   - Output conversion happens at the rendering layer, not in commands

3. **Proper 3D Text Display**: The 3D terminal correctly displays command output
   - Command prompts show with `$ ` prefix
   - Multi-line output renders correctly with line wrapping
   - Output scrolls to show latest content
   - Cursor blinks at correct position after output

4. **Text Extraction**: React output converts to plain text accurately
   - Nested component text is extracted recursively
   - Formatting markers (colors, links) are stripped
   - Whitespace and line breaks are preserved
   - Tables and lists maintain readable structure

5. **Buffer Synchronization**: The text buffer stays in sync with terminal state
   - New output appends to buffer immediately
   - Clear command resets buffer
   - History navigation updates buffer correctly
   - Input line always shows at buffer end

6. **Error Display Parity**: Errors display consistently in both modes
   - Error messages are readable in plain text
   - "Command not found" shows in both modes
   - Syntax errors display with context

### Non-Functional Requirements

- **Performance**: Text extraction adds less than 5ms overhead per command
- **Accuracy**: 100% of visible text in 2D mode appears in 3D mode
- **Compatibility**: Existing commands require zero modifications
- **Maintainability**: Adding new commands doesn't require mode-specific code

## Technical Design

### Components

| Component | Responsibility |
|-----------|---------------|
| commandMap | Single registry of all available commands |
| TerminalHandler | Executes commands, manages state, emits buffer updates |
| extractText | Converts React nodes to plain text strings |
| useTerminalTexture | Renders text buffer to canvas texture for 3D |
| TerminalOutput | Renders React nodes for 2D HTML terminal |

### Data Flow

```
User Input
    ↓
TerminalHandler (executes command via commandMap)
    ↓
Command.run() returns ReactNode
    ↓
┌───────────────────────────────────────┐
│                                       │
↓                                       ↓
2D Mode                              3D Mode (headless)
TerminalOutput                       extractText(ReactNode)
renders ReactNode                        ↓
                                    plainLines buffer
                                        ↓
                                    onBufferChange callback
                                        ↓
                                    useTerminalTexture
                                    renders to canvas
```

### Data Structures

```typescript
// Command interface (existing, unchanged)
interface Command {
  name: string
  description: string
  usage?: React.ReactNode
  args: string[]
  run: (args: string[], context: KeyPressContextType) => Promise<React.ReactNode | null>
}

// Plain text line with metadata
interface PlainLine {
  text: string
  command: boolean  // true if this is a command prompt line
}

// Buffer update callback
type BufferChangeCallback = (lines: string[]) => void

// TerminalHandler props
interface TerminalHandlerProps {
  onBufferChange?: BufferChangeCallback
  headless?: boolean  // true for 3D mode (no HTML rendering)
}
```

### Dependencies

- Existing: `commandMap`, `extractText`, `TerminalHandler`
- Modified: Text extraction may need enhancement for complex React trees
- 3D: `useTerminalTexture` consumes plain text buffer

## User Scenarios & Testing

### Scenario 1: Help Command in 3D Mode
- User types `help` in 3D terminal
- TerminalHandler executes HelpCommand.run()
- Command returns React node with formatted help text
- extractText converts to plain text array
- Buffer updates via onBufferChange
- useTerminalTexture renders text to CRT screen
- All command names and descriptions are readable

### Scenario 2: Multi-line Output
- User types `cat README.md` in 3D terminal
- File contents (multiple lines) returned as React node
- Each line extracted and added to buffer
- Canvas renders with proper line wrapping
- Scroll position adjusted to show latest content

### Scenario 3: Command Not Found
- User types `invalidcmd` in 3D terminal
- Error message generated as React node
- Text extracted: "Command not found: invalidcmd"
- Error displays on CRT screen
- User sees suggestion to type `help`

### Scenario 4: Clear Command
- User types `clear` in 3D terminal
- Buffer is emptied
- Plain lines array reset
- CRT screen shows only prompt
- Ready for new input

### Scenario 5: Projects Command with Links
- User types `projects` in 3D terminal
- Rich output with project cards and GitHub links
- Text extraction preserves project names and descriptions
- Links stripped (URLs optionally preserved as text)
- Structured output remains readable on CRT

## Success Criteria

1. All commands from `commandMap` execute correctly in 3D mode
2. Text on 3D CRT screen matches visible text in 2D terminal
3. Multi-line command output displays with correct line breaks
4. Cursor position updates correctly after command execution
5. Clear command works identically in both modes
6. No command modifications required to support both modes
7. Buffer updates occur synchronously with command completion

## Out of Scope

- Syntax highlighting in 3D mode (plain monochrome text)
- Clickable links in 3D mode (text only)
- Image or media display in 3D mode
- Different command behavior between modes
- Color formatting in 3D terminal text

## Assumptions

- Commands return React nodes (existing behavior preserved)
- extractText utility handles all React node types used by commands
- 3D terminal canvas has fixed dimensions (1024x768)
- Monospace font used in 3D mode for consistent character width
- Line height and margins are preconfigured in useTerminalTexture

## Clarifications

### Session 2026-01-13
- Q: What is the primary issue? → A: 3D terminal doesn't properly display command output after refactoring
- Q: How should commands be shared? → A: Single commandMap serves both 2D and 3D modes; text extraction happens at render layer
