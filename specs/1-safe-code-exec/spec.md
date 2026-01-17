# Feature Specification: Safe Browser Code Execution

## Overview

**Goal:** Enable users to execute Python and JavaScript code files directly in the terminal with full security sandboxing, running entirely client-side with no server involvement.

**Constitution Alignment:**
- [x] Principle 1 (Documentation): Code execution services and security measures will be documented
- [x] Principle 2 (Extensibility): Language support follows a pluggable executor pattern
- [x] Principle 3 (Type Safety): Execution results, errors, and options explicitly typed
- [x] Principle 4 (Separation): Execution logic separated from UI rendering
- [x] Principle 5 (Style): Commands follow established terminal command patterns

## User Scenarios & Testing

### Primary User Flow
1. User creates or edits a Python/JavaScript file using `vim`
2. User runs the file using `python filename.py` or `node filename.js`
3. System displays execution output in terminal
4. If code contains errors, user sees meaningful error messages
5. If code runs too long, execution is terminated with timeout message

### Edge Cases
- Running a non-existent file shows "File not found" error
- Running a file with wrong extension shows "Unsupported file type" error
- Running code with infinite loop terminates after timeout with clear message
- Running code that attempts network access fails gracefully
- Empty files execute without error (no output)

### Test Scenarios
| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Valid Python | `python hello.py` (with print statement) | Printed output displayed |
| Valid JavaScript | `node app.js` (with console.log) | Logged output displayed |
| Syntax error | `python broken.py` | Clear error message with line number |
| File not found | `python missing.py` | "No such file: missing.py" |
| Infinite loop | `python loop.py` (while True) | "Execution timed out after 5 seconds" |
| No file argument | `python` | Usage help displayed |

## Requirements

### Functional Requirements

1. **Python Execution Command**: Users can execute Python files with `python <filename>` command
2. **JavaScript Execution Command**: Users can execute JavaScript files with `node <filename>` command
3. **Output Capture**: All stdout/stderr from executed code is captured and displayed in terminal
4. **Error Reporting**: Syntax errors and runtime errors display with line numbers when available
5. **Execution Timeout**: Code execution terminates after 5 seconds with a timeout message
6. **File Validation**: Commands validate file exists and has correct extension before execution
7. **Help Display**: Running command without arguments shows usage instructions

### Non-Functional Requirements

- **Performance**:
  - Python runtime (Pyodide) lazy-loads on first use to avoid blocking initial page load
  - JavaScript execution starts within 100ms
  - Loading indicator shown while Python runtime initializes
- **Security**:
  - No network access from executed code
  - No filesystem access outside mock filesystem
  - No access to browser APIs (localStorage, DOM, etc.)
  - Memory usage capped to prevent browser crashes
  - Execution isolated from main application context
- **Accessibility**:
  - Output uses semantic terminal styling
  - Error messages are screen-reader friendly

## Success Criteria

1. Users can execute Python files and see output within 2 seconds (after initial load)
2. Users can execute JavaScript files and see output within 500ms
3. First-time Python execution completes within 10 seconds (including runtime download)
4. 100% of executed code runs in browser with zero server requests
5. Malicious code (infinite loops, memory bombs) cannot freeze or crash the browser
6. Users receive clear, actionable error messages for all failure cases

## Technical Design

### Components

| Component | Responsibility |
|-----------|---------------|
| `PythonCommand` | Terminal command handler for `python` |
| `NodeCommand` | Terminal command handler for `node` |
| `CodeExecutor` | Abstract interface for language executors |
| `PythonExecutor` | Pyodide-based Python execution with sandboxing |
| `JavaScriptExecutor` | Web Worker-based JavaScript execution |
| `ExecutionOutput` | React component for displaying execution results |

### Data Structures

```typescript
// Execution result from any language executor
interface ExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  error?: {
    message: string
    line?: number
    column?: number
  }
  executionTime: number // milliseconds
  timedOut: boolean
}

// Configuration for code execution
interface ExecutionOptions {
  timeout: number // milliseconds, default 5000
  maxOutputLines: number // prevent memory issues, default 1000
}

// Language executor interface
interface CodeExecutor {
  readonly language: string
  readonly fileExtensions: string[]
  readonly isReady: boolean
  initialize(): Promise<void>
  execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult>
}
```

### Dependencies

- **Pyodide** (~15MB): WebAssembly Python interpreter for Python execution
- **Web Workers API**: Built-in browser API for JavaScript sandboxing
- Existing: `fileSystem` service for reading file contents
- Existing: `Command` interface for terminal command pattern

### Security Architecture

1. **Python Isolation (Pyodide)**:
   - Runs in WebAssembly sandbox with no DOM access
   - Network APIs disabled via Pyodide configuration
   - File system redirected to mock filesystem only
   - Memory limited by browser's WASM constraints

2. **JavaScript Isolation (Web Worker)**:
   - Runs in separate thread with no DOM access
   - `importScripts` disabled to prevent external code loading
   - `fetch` and `XMLHttpRequest` blocked via worker restrictions
   - Communication only via structured clone (postMessage)

3. **Timeout Enforcement**:
   - Worker terminated if execution exceeds timeout
   - Pyodide execution wrapped in interruptible context

## Out of Scope

- Server-side code execution
- Package/module installation (pip, npm)
- Multi-file project execution
- Persistent execution state between runs
- Interactive input (stdin) during execution
- Debugging/breakpoint support
- Code execution in 3D terminal mode

## Assumptions

- Users understand basic Python/JavaScript syntax
- Files are small enough to execute in browser (< 1MB source code)
- Modern browser with WebAssembly and Web Worker support
- Pyodide CDN is accessible for initial runtime download
- 5-second timeout is sufficient for demonstration code

## Open Questions

- None - all critical decisions resolved with reasonable defaults
