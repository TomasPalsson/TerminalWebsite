# Implementation Plan: Safe Browser Code Execution

## Constitution Check

Before implementation, verify alignment with principles:

| Principle | Approach |
|-----------|----------|
| Documentation | JSDoc comments on CodeExecutor interface, inline comments explaining security measures |
| Extensibility | Plugin architecture - new languages add only a new executor class + command registration |
| Type Safety | ExecutionResult, ExecutionOptions, CodeExecutor interfaces defined in contracts |
| Separation | Executors handle execution logic, Commands handle terminal integration, Output component handles display |
| Style | Tailwind for output styling, 2-space indent, no semicolons, Command interface pattern |

## Implementation Steps

### Phase 1: Core Infrastructure

- [ ] Create types file `src/types/executor.ts` with ExecutionResult, ExecutionOptions, CodeExecutor interfaces
- [ ] Create base executor utilities `src/services/executor/index.ts` with shared timeout logic
- [ ] Create execution output component `src/components/ExecutionOutput.tsx` for displaying results

### Phase 2: JavaScript Executor

- [ ] Create Web Worker code as inline blob `src/services/executor/jsWorker.ts`
- [ ] Create JavaScript executor `src/services/executor/JavaScriptExecutor.ts`
- [ ] Create `node` command `src/components/commands/NodeCommand.tsx`
- [ ] Register `node` command in `CommandMap.tsx`
- [ ] Test JavaScript execution with simple scripts

### Phase 3: Python Executor

- [ ] Create Pyodide loader utility `src/services/executor/pyodideLoader.ts`
- [ ] Create Python executor `src/services/executor/PythonExecutor.ts`
- [ ] Create `python` command `src/components/commands/PythonCommand.tsx`
- [ ] Register `python` command in `CommandMap.tsx`
- [ ] Test Python execution with simple scripts

### Phase 4: Polish & Edge Cases

- [ ] Add loading indicator for Python first-run
- [ ] Add file extension validation to commands
- [ ] Handle empty file execution
- [ ] Add help text for both commands
- [ ] Disable commands in 3D terminal mode (headless context)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/types/executor.ts` | Create | Type definitions for execution system |
| `src/services/executor/index.ts` | Create | Shared executor utilities and timeout helpers |
| `src/services/executor/jsWorker.ts` | Create | Inline Web Worker code for JS execution |
| `src/services/executor/JavaScriptExecutor.ts` | Create | JS execution implementation |
| `src/services/executor/pyodideLoader.ts` | Create | Lazy Pyodide loading utility |
| `src/services/executor/PythonExecutor.ts` | Create | Python execution implementation |
| `src/components/ExecutionOutput.tsx` | Create | Display component for execution results |
| `src/components/commands/NodeCommand.tsx` | Create | Terminal command for `node` |
| `src/components/commands/PythonCommand.tsx` | Create | Terminal command for `python` |
| `src/components/commands/CommandMap.tsx` | Modify | Register new commands |

## Testing Strategy

- [ ] Unit tests for timeout enforcement (mock timers)
- [ ] Unit tests for output capture (mock console/stdout)
- [ ] Manual verification: `python hello.py` shows output
- [ ] Manual verification: `node app.js` shows output
- [ ] Manual verification: Infinite loop times out correctly
- [ ] Manual verification: Syntax errors show line numbers
- [ ] Manual verification: Commands disabled in 3D mode

## Rollback Plan

If issues arise:
1. Remove command registrations from `CommandMap.tsx`
2. Delete new files in `src/services/executor/`
3. Delete new command files
4. No database migrations or persistent state to revert

## Dependencies

### External (npm install required)
- None - Pyodide loaded from CDN at runtime

### Internal (existing code reused)
- `fileSystem` service - reading file contents
- `Command` interface - terminal command pattern
- `KeyPressContextType` - headless mode detection

## Security Verification Checklist

Before marking complete, verify:
- [ ] JS Worker cannot access `window`, `document`, `localStorage`
- [ ] JS Worker cannot make `fetch` or `XMLHttpRequest` calls
- [ ] Python cannot access network via `urllib`, `requests`, etc.
- [ ] Python filesystem operations fail or use mock FS only
- [ ] Both executors terminate within timeout
- [ ] Large output is truncated (maxOutputLines)

## Estimated Complexity

| Phase | Complexity | Notes |
|-------|------------|-------|
| Phase 1 | Low | Types and utilities only |
| Phase 2 | Medium | Worker sandboxing requires careful setup |
| Phase 3 | Medium | Pyodide integration and lazy loading |
| Phase 4 | Low | Edge cases and polish |

Total: ~4-6 hours implementation time
