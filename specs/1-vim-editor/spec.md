# Feature Specification: Vim Editor

## Overview

**Goal:** Add a vim command to the terminal that opens a basic vim-like text editor for creating and editing files in the mock filesystem.

**Constitution Alignment:**
- [x] Principle 1 (Documentation): Interfaces and complex logic will be documented
- [x] Principle 2 (Extensibility): Feature follows modular patterns
- [x] Principle 3 (Type Safety): All types explicitly defined
- [x] Principle 4 (Separation): Clear component/logic boundaries
- [x] Principle 5 (Style): Follows established code style

## User Scenarios & Testing

### Primary Scenario: Create New File
**As a** terminal user
**I want to** type `vim newfile.txt` and enter a text editor
**So that** I can create files with content directly from the terminal

**Acceptance Criteria:**
1. Running `vim newfile.txt` opens an editor interface
2. User can type content in INSERT mode
3. User can save the file with `:w` command
4. User can exit with `:q` command
5. File is saved to the mock filesystem

### Secondary Scenario: Edit Existing File
**As a** terminal user
**I want to** type `vim existingfile.txt` to edit an existing file
**So that** I can modify file contents

**Acceptance Criteria:**
1. Running `vim` on an existing file loads its content
2. Changes can be saved with `:w`
3. Original file is updated in the mock filesystem

### Tertiary Scenario: Navigate and Edit Text
**As a** terminal user
**I want to** use basic vim motions to navigate and edit
**So that** I can efficiently modify text

**Acceptance Criteria:**
1. User can switch between NORMAL and INSERT modes
2. Basic navigation works (h, j, k, l, or arrow keys)
3. Basic editing commands work (i, a, x, dd, yy, p)
4. Mode indicator shows current mode

## Requirements

### Functional Requirements

1. **FR-1: Open Editor Command**
   - `vim <filename>` opens the editor with the specified file
   - `vim` without arguments opens editor with empty buffer
   - If file exists, load its content; otherwise, start with empty buffer

2. **FR-2: Mode System**
   - NORMAL mode: Navigation and commands
   - INSERT mode: Text input
   - COMMAND mode: Ex commands (`:w`, `:q`, etc.)
   - Visual indicator showing current mode

3. **FR-3: Basic Navigation (NORMAL mode)**
   - `h` or Left Arrow: Move cursor left
   - `j` or Down Arrow: Move cursor down
   - `k` or Up Arrow: Move cursor up
   - `l` or Right Arrow: Move cursor right
   - `w`: Move to start of next word
   - `b`: Move to start of previous word
   - `e`: Move to end of current/next word
   - `0`: Move to beginning of line
   - `$`: Move to end of line
   - `gg`: Move to first line
   - `G`: Move to last line

4. **FR-4: Mode Switching**
   - `i`: Enter INSERT mode at cursor
   - `a`: Enter INSERT mode after cursor
   - `o`: Open new line below and enter INSERT mode
   - `O`: Open new line above and enter INSERT mode
   - `Escape`: Return to NORMAL mode from any mode

5. **FR-5: Basic Editing (NORMAL mode)**
   - `x`: Delete character under cursor
   - `dd`: Delete current line
   - `yy`: Yank (copy) current line
   - `p`: Paste after cursor
   - `u`: Undo last change

6. **FR-6: Ex Commands (COMMAND mode)**
   - `:w` - Save file to mock filesystem
   - `:q` - Quit editor (return to terminal)
   - `:wq` or `:x` - Save and quit
   - `:q!` - Quit without saving (discard changes)

7. **FR-7: File Integration**
   - Save files to the existing mock filesystem service
   - Load files from the existing mock filesystem service
   - Respect current working directory for relative paths

8. **FR-8: Visual Feedback**
   - Line numbers displayed
   - Current mode indicator (NORMAL, INSERT, COMMAND)
   - Cursor position indicator (line:column)
   - Filename and modification status in status bar
   - Unsaved changes indicator

### Non-Functional Requirements

- **Performance:** Editor should feel responsive with no perceptible lag when typing
- **Accessibility:** Keyboard-only operation (consistent with vim philosophy)
- **Visual Consistency:** Match the terminal's dark theme with terminal green accents

## Key Entities

| Entity | Description |
|--------|-------------|
| EditorBuffer | Holds the text content being edited as an array of lines |
| EditorState | Tracks cursor position, mode, filename, modified status |
| EditorCommand | Represents a vim command (navigation, edit, ex command) |

## Assumptions

1. **Package Usage:** Will use `@uiwjs/react-codemirror` with `@replit/codemirror-vim` extension for vim keybindings, as this provides a mature, well-tested implementation
2. **File Size:** Files being edited are expected to be small (under 10KB), typical for the portfolio demo context
3. **Single Buffer:** Only one file will be open at a time (no split views or tabs)
4. **Persistence:** Files are saved to the existing localStorage-backed mock filesystem
5. **Undo History:** Undo history is session-only (cleared when editor closes)

## Out of Scope

- Visual mode (v, V, Ctrl-V) for block selection
- Search and replace (/, ?, :s)
- Macros and registers
- Split windows or tabs
- Syntax highlighting for specific languages
- Configuration/vimrc support
- Marks and jumps
- Text objects (ciw, diw, etc.)
- Operator + motion combinations (dw, cw, etc.)

## Success Criteria

1. Users can create new files by typing `vim filename.txt`, entering content, and saving with `:wq`
2. Users can edit existing files and see changes persisted to the mock filesystem
3. Mode switching between NORMAL and INSERT feels natural to vim users
4. All listed keybindings work as expected
5. Editor visually matches the terminal's established aesthetic
6. Users unfamiliar with vim can figure out basic usage within 2 minutes (mode indicator helps)

## Clarifications

### Session 2026-01-13
- Q: Should word motions (w, b, e) be included? → A: Yes, include w/b/e as standalone navigation motions, but exclude operator+motion combinations (dw, cw, etc.)

## Open Questions

None - all requirements are sufficiently specified for implementation.
