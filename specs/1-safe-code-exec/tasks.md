# Tasks: Safe Browser Code Execution

## User Stories (from spec.md)

| ID | Story | Priority |
|----|-------|----------|
| US1 | Execute JavaScript files with `node` command | P1 (MVP) |
| US2 | Execute Python files with `python` command | P2 |
| US3 | Handle errors and edge cases gracefully | P3 |

## Dependency Graph

```
Phase 1 (Setup) ─────────────────────────────┐
     │                                        │
     ▼                                        │
Phase 2 (Foundation) ────────────────────────┤
     │                                        │
     ├──────────────┬─────────────────────────┤
     ▼              ▼                         │
Phase 3 (US1)   Phase 4 (US2)                │
     │              │                         │
     └──────────────┴─────────────────────────┤
                    │                         │
                    ▼                         │
              Phase 5 (US3)                   │
                    │                         │
                    ▼                         │
              Phase 6 (Polish) ◄──────────────┘
```

## Parallel Execution Opportunities

| Phase | Parallelizable Tasks |
|-------|---------------------|
| Phase 2 | T004 ‖ T005 (types and utilities) |
| Phase 3 | T006 ‖ T007 (worker code and executor) |
| Phase 4 | T010 ‖ T011 (loader and executor) |
| Phase 5 | T014 ‖ T015 ‖ T016 (error handling improvements) |

---

## Phase 1: Setup

**Goal:** Create directory structure for executor services

- [X] T001 Create executor services directory at `src/services/executor/`

---

## Phase 2: Foundation (Blocking Prerequisites)

**Goal:** Establish shared types, utilities, and output component used by all user stories

**Independent Test:** Types compile without errors; ExecutionOutput renders mock data

- [X] T002 [P] Create type definitions in `src/types/executor.ts` (copy from contracts/executor-interface.ts)
- [X] T003 [P] Create shared executor utilities with timeout helper in `src/services/executor/index.ts`
- [X] T004 Create ExecutionOutput component for displaying results in `src/components/ExecutionOutput.tsx`

---

## Phase 3: User Story 1 - JavaScript Execution (MVP)

**Goal:** Users can execute JavaScript files with `node <filename>` command

**Independent Test:**
- `vim test.js` → add `console.log("Hello JS")` → `:wq`
- `node test.js` → displays "Hello JS"
- Infinite loop times out after 5 seconds

- [X] T005 [US1] Create sandboxed Web Worker code in `src/services/executor/jsWorker.ts`
- [X] T006 [US1] Create JavaScriptExecutor implementing CodeExecutor in `src/services/executor/JavaScriptExecutor.ts`
- [X] T007 [US1] Create NodeCommand terminal command in `src/components/commands/NodeCommand.tsx`
- [X] T008 [US1] Register `node` command in `src/components/commands/CommandMap.tsx`

---

## Phase 4: User Story 2 - Python Execution

**Goal:** Users can execute Python files with `python <filename>` command

**Independent Test:**
- `vim hello.py` → add `print("Hello Python")` → `:wq`
- `python hello.py` → shows loading indicator → displays "Hello Python"
- First run downloads Pyodide from CDN (cached for subsequent runs)

- [X] T009 [US2] Create Pyodide lazy loader utility in `src/services/executor/pyodideLoader.ts`
- [X] T010 [US2] Create PythonExecutor implementing CodeExecutor in `src/services/executor/PythonExecutor.ts`
- [X] T011 [US2] Create PythonCommand terminal command in `src/components/commands/PythonCommand.tsx`
- [X] T012 [US2] Register `python` command in `src/components/commands/CommandMap.tsx`

---

## Phase 5: User Story 3 - Error Handling & Edge Cases

**Goal:** All error scenarios provide clear, actionable feedback to users

**Independent Test:**
- `python missing.py` → "No such file: missing.py"
- `python` (no args) → shows usage help
- `node script.txt` → "Unsupported file type"
- Syntax error shows line number

- [X] T013 [US3] Add file existence validation to NodeCommand in `src/components/commands/NodeCommand.tsx`
- [X] T014 [US3] Add file existence validation to PythonCommand in `src/components/commands/PythonCommand.tsx`
- [X] T015 [US3] Add file extension validation (.js/.mjs for node, .py for python)
- [X] T016 [US3] Add help text display when commands run without arguments
- [X] T017 [US3] Enhance error parsing to extract line numbers in `src/services/executor/index.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal:** Production-ready UX with loading states and 3D mode handling

- [X] T018 Add loading indicator to PythonCommand during Pyodide initialization
- [X] T019 Disable both commands in 3D terminal mode (check `context.headless`)
- [X] T020 Handle empty file execution gracefully (no output, success)
- [X] T021 Add output truncation when exceeding maxOutputLines limit
- [X] T022 Verify security: test that Worker cannot access window/fetch/localStorage
- [X] T023 Verify security: test that Python cannot access network/real filesystem

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)
- **Phase 1 + Phase 2 + Phase 3 (US1)** = JavaScript execution only
- Delivers working `node` command with full security sandboxing
- ~2 hours implementation time
- Can be shipped and tested before adding Python

### Full Feature
- All phases (1-6)
- ~4-6 hours total implementation time

---

## Files Summary

| File | Action | Phase |
|------|--------|-------|
| `src/services/executor/` | Create dir | 1 |
| `src/types/executor.ts` | Create | 2 |
| `src/services/executor/index.ts` | Create | 2 |
| `src/components/ExecutionOutput.tsx` | Create | 2 |
| `src/services/executor/jsWorker.ts` | Create | 3 |
| `src/services/executor/JavaScriptExecutor.ts` | Create | 3 |
| `src/components/commands/NodeCommand.tsx` | Create | 3 |
| `src/components/commands/CommandMap.tsx` | Modify | 3, 4 |
| `src/services/executor/pyodideLoader.ts` | Create | 4 |
| `src/services/executor/PythonExecutor.ts` | Create | 4 |
| `src/components/commands/PythonCommand.tsx` | Create | 4 |

---

## Completion Checklist

- [X] All 23 tasks completed
- [X] US1 independently testable (node command works)
- [X] US2 independently testable (python command works)
- [X] US3 independently testable (errors handled)
- [X] Security verification passed
- [X] Constitution principles verified
- [X] Manual testing completed per quickstart.md
