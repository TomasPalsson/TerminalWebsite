# Tasks: Vim Editor

## Overview

**Feature**: Add vim command with basic text editing capabilities
**Branch**: 1-vim-editor
**Total Tasks**: 22

## User Stories

| Story | Priority | Description | Tasks |
|-------|----------|-------------|-------|
| US1 | P1 | Create New File | T008-T012 |
| US2 | P2 | Edit Existing File | T013-T015 |
| US3 | P3 | Navigate and Edit | T016-T018 |

## Dependencies

```
Setup Phase (T001-T003) → Foundational Phase (T004-T007) → US1 (T008-T012) → US2 (T013-T015) → US3 (T016-T018) → Polish (T019-T022)
```

**Parallel Opportunities:**
- T004, T005 can run in parallel (types and theme are independent)
- T010, T011 can run in parallel (Ex commands are independent)
- T019, T020, T021 can run in parallel (testing different aspects)

---

## Phase 1: Setup

**Goal**: Install dependencies and create project structure

- [x] T001 Install CodeMirror packages: `npm install @uiw/react-codemirror @replit/codemirror-vim @codemirror/state @codemirror/view`
- [x] T002 Create vim command directory structure at `src/components/commands/vim/`
- [x] T003 Verify packages work with Vite by creating minimal test component

---

## Phase 2: Foundational

**Goal**: Create shared types, theme, and base editor component that all user stories depend on

- [x] T004 [P] Create TypeScript types in `src/components/commands/vim/types.ts` with VimEditorProps, VimEditorState, VimMode
- [x] T005 [P] Create CodeMirror theme in `src/components/commands/vim/vimTheme.ts` matching terminal aesthetic (black bg, white text, green accents)
- [x] T006 Create base VimEditor component shell in `src/components/commands/vim/VimEditor.tsx` with CodeMirror + vim extension
- [x] T007 Implement status bar in `src/components/commands/vim/VimEditor.tsx` showing mode, filename, line:col, modified indicator

---

## Phase 3: User Story 1 - Create New File (P1)

**Goal**: Users can create new files with `vim newfile.txt`, enter content, and save

**Independent Test Criteria**:
1. `vim test.txt` opens editor with empty buffer
2. Pressing `i` enters INSERT mode (mode indicator updates)
3. Typing adds content to buffer
4. `:w` saves file to mock filesystem
5. `:q` closes editor and returns to terminal
6. File persists in filesystem (verifiable with `cat test.txt`)

### Tasks

- [x] T008 [US1] Create VimCommand in `src/components/commands/vim/VimCommand.tsx` implementing Command interface
- [x] T009 [US1] Register VimCommand in `src/components/commands/CommandMap.tsx`
- [x] T010 [P] [US1] Implement `:w` Ex command in `src/components/commands/vim/VimEditor.tsx` to save to fileSystem service
- [x] T011 [P] [US1] Implement `:q` Ex command in `src/components/commands/vim/VimEditor.tsx` with unsaved changes check
- [x] T012 [US1] Implement terminal overlay mode in `src/screens/Terminal.tsx` to display VimEditor fullscreen

---

## Phase 4: User Story 2 - Edit Existing File (P2)

**Goal**: Users can edit existing files and persist changes

**Independent Test Criteria**:
1. Create file with `echo "hello" > existing.txt`
2. `vim existing.txt` opens editor with "hello" content loaded
3. Modify content, `:w` saves changes
4. `cat existing.txt` shows updated content

### Tasks

- [x] T013 [US2] Implement file loading in `src/components/commands/vim/VimCommand.tsx` using fileSystem.readFile()
- [x] T014 [US2] Implement `:wq` and `:x` Ex commands in `src/components/commands/vim/VimEditor.tsx` for save-and-quit
- [x] T015 [US2] Implement `:q!` Ex command in `src/components/commands/vim/VimEditor.tsx` for force-quit without saving

---

## Phase 5: User Story 3 - Navigate and Edit (P3)

**Goal**: Basic vim motions and editing commands work correctly

**Independent Test Criteria**:
1. Navigation: h/j/k/l, w/b/e, 0/$, gg/G all move cursor correctly
2. Mode switching: i/a/o/O enter INSERT, Escape returns to NORMAL
3. Editing: x deletes char, dd deletes line, yy/p copies/pastes, u undoes

**Note**: Most vim motions are provided by @replit/codemirror-vim out of the box. These tasks verify and polish the integration.

### Tasks

- [x] T016 [US3] Verify all navigation keybindings work in `src/components/commands/vim/VimEditor.tsx` (h,j,k,l,w,b,e,0,$,gg,G)
- [x] T017 [US3] Verify mode switching works correctly (i,a,o,O,Escape) and mode indicator updates
- [x] T018 [US3] Verify editing commands work (x,dd,yy,p,u) and buffer state updates correctly

---

## Phase 6: Polish & Cross-Cutting

**Goal**: Final integration, help text, and comprehensive testing

- [x] T019 [P] Add vim to HelpCommand categories in `src/components/commands/HelpCommand.tsx`
- [x] T020 [P] Add usage documentation to VimCommand in `src/components/commands/vim/VimCommand.tsx`
- [x] T021 [P] Create barrel export in `src/components/commands/vim/index.ts`
- [x] T022 Manual verification: Complete end-to-end testing of all acceptance criteria from spec.md

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)
- **Phases 1-3 (T001-T012)**: Delivers US1 - Create New File
- Users can: Open vim, type content, save, quit
- Excludes: Loading existing files, force-quit

### Incremental Delivery
1. **Increment 1**: Setup + Foundational + US1 (T001-T012) - Core editor works
2. **Increment 2**: US2 (T013-T015) - File loading and :wq/:q! commands
3. **Increment 3**: US3 (T016-T018) - Verify all keybindings
4. **Increment 4**: Polish (T019-T022) - Help text and final testing

---

## Completion Checklist

- [x] All 22 tasks completed
- [x] Constitution principles verified (doc, extensibility, types, separation, style)
- [x] Manual testing passed for all 3 user stories
- [x] Code follows project conventions (2-space indent, no semicolons, Tailwind only)
