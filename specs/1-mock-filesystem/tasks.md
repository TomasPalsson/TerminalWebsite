# Tasks: Mock Filesystem & Git

**Feature**: Mock Filesystem & Git for Terminal Portfolio
**Branch**: `1-mock-filesystem`
**Created**: 2026-01-12

## User Stories Summary

| ID | Story | Priority | Dependencies |
|----|-------|----------|--------------|
| US1 | File System Navigation | P1 | Setup |
| US2 | File Operations | P2 | US1 |
| US3 | File Editing | P3 | US2 |
| US4 | Git Version Control | P4 | US2 |
| US5 | Persistence & Reset | P5 | US1, US4 |

---

## Phase 1: Setup

**Goal**: Project structure and type definitions

- [x] T001 Create types directory at src/types/
- [x] T002 [P] Create filesystem types in src/types/filesystem.ts
- [x] T003 [P] Create git types in src/types/git.ts
- [x] T004 Create services directory at src/services/
- [x] T005 Create fs commands directory at src/components/commands/fs/
- [x] T006 Create git commands directory at src/components/commands/git/

---

## Phase 2: Foundational (Core Services)

**Goal**: Build core services that all user stories depend on

### FileSystem Service

- [x] T007 Implement FileSystemService class skeleton in src/services/filesystem.ts
- [x] T008 Implement path resolution (resolvePath, normalizePath) in src/services/filesystem.ts
- [x] T009 Implement node traversal (getNode, exists, isDirectory, isFile) in src/services/filesystem.ts
- [x] T010 Implement default filesystem structure in src/services/filesystem.ts
- [x] T011 Implement localStorage persistence (load/save) in src/services/filesystem.ts
- [x] T012 Implement getCwd and initialize methods in src/services/filesystem.ts
- [x] T013 Export filesystem service singleton in src/services/filesystem.ts

### Git Service

- [x] T014 Implement GitService class skeleton in src/services/git.ts
- [x] T015 Implement hash generation utility in src/services/git.ts
- [x] T016 Implement localStorage persistence for git state in src/services/git.ts
- [x] T017 Export git service singleton in src/services/git.ts

---

## Phase 3: User Story 1 - File System Navigation

**Goal**: Users can navigate through directories using cd, ls, pwd

**Test Criteria**: User can run `pwd`, `cd /home`, `ls`, `cd ..`, and tab-complete paths

### Service Methods

- [x] T018 [US1] Implement cd method in src/services/filesystem.ts
- [x] T019 [US1] Implement ls method with -a and -l flags in src/services/filesystem.ts
- [x] T020 [US1] Implement getCompletions for tab completion in src/services/filesystem.ts

### Commands

- [x] T021 [US1] Create PwdCommand with styled output in src/components/commands/fs/PwdCommand.tsx
- [x] T022 [US1] Create CdCommand with error handling in src/components/commands/fs/CdCommand.tsx
- [x] T023 [US1] Create LsCommand with card layout, icons, -a/-l flags in src/components/commands/fs/LsCommand.tsx

### Integration

- [x] T024 [US1] Register pwd, cd, ls commands in src/components/commands/CommandMap.tsx
- [x] T025 [US1] Add "Filesystem" category to help in src/components/commands/HelpCommand.tsx
- [x] T026 [US1] Implement tab completion handler in src/components/TerminalHandler.tsx

---

## Phase 4: User Story 2 - File Operations

**Goal**: Users can create, read, and delete files and directories

**Test Criteria**: User can `touch file.txt`, `cat file.txt`, `mkdir dir`, `rm file.txt`, `cp src dest`, `mv src dest`

### Service Methods

- [x] T027 [US2] Implement touch method in src/services/filesystem.ts
- [x] T028 [US2] Implement cat method in src/services/filesystem.ts
- [x] T029 [US2] Implement mkdir method in src/services/filesystem.ts
- [x] T030 [US2] Implement rm method with recursive option in src/services/filesystem.ts
- [x] T031 [US2] Implement rmdir method in src/services/filesystem.ts
- [x] T032 [US2] Implement cp method with deep copy in src/services/filesystem.ts
- [x] T033 [US2] Implement mv method in src/services/filesystem.ts

### Commands

- [x] T034 [P] [US2] Create TouchCommand with styled output in src/components/commands/fs/TouchCommand.tsx
- [x] T035 [P] [US2] Create CatCommand with file content display in src/components/commands/fs/CatCommand.tsx
- [x] T036 [P] [US2] Create MkdirCommand with success/error states in src/components/commands/fs/MkdirCommand.tsx
- [x] T037 [P] [US2] Create RmCommand with -r flag support in src/components/commands/fs/RmCommand.tsx
- [x] T038 [P] [US2] Create CpCommand with styled output in src/components/commands/fs/CpCommand.tsx
- [x] T039 [P] [US2] Create MvCommand with styled output in src/components/commands/fs/MvCommand.tsx

### Integration

- [x] T040 [US2] Register touch, cat, mkdir, rm, rmdir, cp, mv commands in src/components/commands/CommandMap.tsx

---

## Phase 5: User Story 3 - File Editing

**Goal**: Users can modify file contents using echo redirection

**Test Criteria**: User can `echo "hello" > file.txt`, `echo "world" >> file.txt`, `cat file.txt` shows both lines

### Service Methods

- [x] T041 [US3] Implement writeFile method in src/services/filesystem.ts
- [x] T042 [US3] Implement appendFile method in src/services/filesystem.ts

### Commands

- [x] T043 [US3] Extend EchoCommand with > and >> redirection in src/components/commands/EchoCommand.tsx
- [x] T044 [US3] Add redirection parsing (detect >, >> operators) in src/components/commands/EchoCommand.tsx
- [x] T045 [US3] Handle quoted strings in echo arguments in src/components/commands/EchoCommand.tsx

---

## Phase 6: User Story 4 - Git Version Control

**Goal**: Users can use git commands for version control

**Test Criteria**: User can `git init`, `git status`, `git add .`, `git commit -m "msg"`, `git log`, `git branch`, `git checkout`, `git merge`

### Service Methods

- [x] T046 [US4] Implement init method in src/services/git.ts
- [x] T047 [US4] Implement status method in src/services/git.ts
- [x] T048 [US4] Implement add and addAll methods in src/services/git.ts
- [x] T049 [US4] Implement reset method in src/services/git.ts
- [x] T050 [US4] Implement commit method with snapshot in src/services/git.ts
- [x] T051 [US4] Implement log method in src/services/git.ts
- [x] T052 [US4] Implement show method in src/services/git.ts
- [x] T053 [US4] Implement branch and listBranches methods in src/services/git.ts
- [x] T054 [US4] Implement checkout method with filesystem restore in src/services/git.ts
- [x] T055 [US4] Implement merge method (fast-forward only) in src/services/git.ts
- [x] T056 [US4] Implement diff method in src/services/git.ts

### Commands

- [x] T057 [US4] Create GitCommand handler with subcommand routing in src/components/commands/git/GitCommand.tsx
- [x] T058 [US4] Implement git init subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T059 [US4] Implement git status subcommand UI with colored badges in src/components/commands/git/GitCommand.tsx
- [x] T060 [US4] Implement git add subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T061 [US4] Implement git commit subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T062 [US4] Implement git log subcommand UI with commit cards in src/components/commands/git/GitCommand.tsx
- [x] T063 [US4] Implement git branch subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T064 [US4] Implement git checkout subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T065 [US4] Implement git merge subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T066 [US4] Implement git diff subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T067 [US4] Implement git show subcommand UI in src/components/commands/git/GitCommand.tsx
- [x] T068 [US4] Implement git reset subcommand UI in src/components/commands/git/GitCommand.tsx

### Integration

- [x] T069 [US4] Register git command in src/components/commands/CommandMap.tsx
- [x] T070 [US4] Add "Git" category to help in src/components/commands/HelpCommand.tsx
- [x] T071 [US4] Add git branch to terminal prompt in src/components/terminal/TerminalPrompt.tsx

---

## Phase 7: User Story 5 - Persistence & Reset

**Goal**: Filesystem and git state persists across sessions with reset option

**Test Criteria**: Refresh browser → state preserved. Run `clearfs` → filesystem reset to default

### Service Methods

- [x] T072 [US5] Add auto-persist on state changes in src/services/filesystem.ts
- [x] T073 [US5] Add auto-persist on state changes in src/services/git.ts
- [x] T074 [US5] Implement reset method in src/services/filesystem.ts
- [x] T075 [US5] Implement getStorageUsage method in src/services/filesystem.ts

### Commands

- [x] T076 [US5] Create ClearFsCommand to reset filesystem in src/components/commands/fs/ClearFsCommand.tsx
- [x] T077 [US5] Add storage usage warning when approaching limit in src/services/filesystem.ts

### Integration

- [x] T078 [US5] Register clearfs command in src/components/commands/CommandMap.tsx
- [x] T079 [US5] Initialize filesystem service on terminal load in src/screens/Terminal.tsx

---

## Phase 8: Search Commands & Polish

**Goal**: Add search functionality and final polish

### Search Commands

- [x] T080 [P] Implement find method in src/services/filesystem.ts
- [x] T081 [P] Implement grep method in src/services/filesystem.ts
- [x] T082 [P] Create FindCommand with pattern matching in src/components/commands/fs/FindCommand.tsx
- [x] T083 [P] Create GrepCommand with line highlighting in src/components/commands/fs/GrepCommand.tsx
- [x] T084 Register find, grep commands in src/components/commands/CommandMap.tsx

### Help Documentation

- [ ] T085 [P] Add interactive examples to PwdCommand usage in src/components/commands/fs/PwdCommand.tsx
- [ ] T086 [P] Add interactive examples to CdCommand usage in src/components/commands/fs/CdCommand.tsx
- [ ] T087 [P] Add interactive examples to LsCommand usage in src/components/commands/fs/LsCommand.tsx
- [ ] T088 [P] Add interactive examples to all file operation commands
- [ ] T089 [P] Add interactive examples to GitCommand usage in src/components/commands/git/GitCommand.tsx

### Polish

- [ ] T090 Add comprehensive error messages for edge cases across all commands
- [ ] T091 Verify all commands follow output styling requirements from spec
- [ ] T092 Test tab completion with various path patterns
- [ ] T093 Test persistence across browser refresh
- [ ] T094 Test full git workflow (init → add → commit → branch → merge)

---

## Dependencies Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Navigation) ──────────────────┐
    ↓                                        ↓
Phase 4 (US2: File Ops) ────────────┐   Phase 7 (US5: Persistence)
    ↓                                ↓
Phase 5 (US3: Editing)          Phase 6 (US4: Git)
    ↓                                ↓
    └────────────────────────────────┘
                    ↓
            Phase 8 (Polish)
```

## Parallel Execution Opportunities

### Phase 1 (Setup)
```
T002 ─┬─ T003
      │
T005 ─┴─ T006
```

### Phase 4 (US2: File Operations)
```
T034 ─┬─ T035 ─┬─ T036
      │        │
T037 ─┴─ T038 ─┴─ T039
```

### Phase 8 (Polish)
```
T080 ─┬─ T081
      │
T082 ─┴─ T083

T085 ─┬─ T086 ─┬─ T087
      │        │
T088 ─┴─ T089 ─┘
```

---

## Implementation Strategy

### MVP Scope (Phases 1-3)
- Core filesystem service
- Navigation commands (pwd, cd, ls)
- Tab completion
- Basic persistence

**Deliverable**: Users can navigate the mock filesystem

### Increment 1 (Phases 4-5)
- File CRUD operations
- Echo redirection
- Full file management

**Deliverable**: Users can manage files and directories

### Increment 2 (Phase 6)
- Full git command suite
- Branch in prompt
- Git help documentation

**Deliverable**: Users can perform git workflows

### Increment 3 (Phases 7-8)
- Robust persistence
- Search commands
- Help documentation
- Polish and edge cases

**Deliverable**: Production-ready feature

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| 1. Setup | 6 | 4 |
| 2. Foundational | 11 | 0 |
| 3. US1 Navigation | 9 | 0 |
| 4. US2 File Ops | 14 | 6 |
| 5. US3 Editing | 5 | 0 |
| 6. US4 Git | 27 | 0 |
| 7. US5 Persistence | 8 | 0 |
| 8. Polish | 15 | 10 |
| **Total** | **95** | **20** |
