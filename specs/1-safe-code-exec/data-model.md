# Data Model: Safe Browser Code Execution

## Core Entities

### ExecutionResult

Represents the outcome of executing code in any language.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Whether execution completed without errors |
| stdout | string | Yes | Captured standard output (may be empty) |
| stderr | string | Yes | Captured standard error (may be empty) |
| error | ErrorInfo | No | Error details if execution failed |
| executionTime | number | Yes | Milliseconds taken to execute |
| timedOut | boolean | Yes | Whether execution was terminated due to timeout |

### ErrorInfo

Detailed information about an execution error.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | Human-readable error message |
| type | string | No | Error type (SyntaxError, TypeError, etc.) |
| line | number | No | Line number where error occurred |
| column | number | No | Column number where error occurred |

### ExecutionOptions

Configuration options for code execution.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| timeout | number | 5000 | Maximum execution time in milliseconds |
| maxOutputLines | number | 1000 | Maximum lines of output to capture |

### ExecutorState

Tracks the initialization state of a language executor.

| Field | Type | Description |
|-------|------|-------------|
| language | string | Language identifier (python, javascript) |
| isReady | boolean | Whether runtime is loaded and ready |
| isLoading | boolean | Whether runtime is currently loading |
| error | string | Error message if initialization failed |

## State Transitions

### Executor Lifecycle

```
[Idle] --initialize()--> [Loading] --success--> [Ready]
                              |
                              +--failure--> [Error]

[Ready] --execute()--> [Executing] --complete--> [Ready]
                              |
                              +--timeout--> [Ready] (with timedOut result)
```

### Execution Flow

```
[Input] --validate file--> [Read File] --get code--> [Execute]
   |                            |                         |
   +--no args--> [Show Help]    +--not found--> [Error]   +--success--> [Display Output]
                                                          |
                                                          +--error--> [Display Error]
                                                          |
                                                          +--timeout--> [Display Timeout]
```

## Validation Rules

### File Validation
- File path must not be empty
- File must exist in mock filesystem
- File extension must match command (`.py` for python, `.js` for node)
- File size should be < 1MB (soft limit, warn user)

### Execution Validation
- Code string must not be empty (but can execute, just no output)
- Timeout must be positive integer
- maxOutputLines must be positive integer

### Output Validation
- Stdout/stderr truncated at maxOutputLines
- Output strings sanitized for terminal display (no control characters except newlines)

## Relationships

```
Command (1) ----uses----> (1) Executor
   |
   +--reads--> FileSystem (existing)
   |
   +--returns--> ExecutionResult

Executor (1) ----produces----> (*) ExecutionResult
   |
   +--configured by--> ExecutionOptions
```

## Storage

No persistent storage required. All execution is ephemeral:
- Executor runtime cached in browser memory (Pyodide)
- No execution history saved
- No state persists between page reloads
