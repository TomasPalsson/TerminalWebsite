# Quickstart: Safe Browser Code Execution

## Overview

This feature adds `python` and `node` commands to the terminal, allowing users to execute code files safely in the browser.

## Usage

### Python Execution

```bash
# Create a Python file
vim hello.py

# Edit the file (press 'i' for insert mode, then type):
print("Hello, World!")
# Save and exit (Esc, then :wq)

# Run the file
python hello.py
# Output: Hello, World!
```

### JavaScript Execution

```bash
# Create a JavaScript file
vim app.js

# Edit the file:
console.log("Hello from JavaScript!");
const sum = (a, b) => a + b;
console.log("2 + 3 =", sum(2, 3));
# Save and exit

# Run the file
node app.js
# Output:
# Hello from JavaScript!
# 2 + 3 = 5
```

## Command Reference

### `python <filename>`

Execute a Python file using Pyodide (Python in WebAssembly).

**First Run**: Downloads ~15MB runtime (cached for future use)
**Timeout**: 5 seconds maximum execution time

### `node <filename>`

Execute a JavaScript file in an isolated Web Worker.

**Instant**: No download required
**Timeout**: 5 seconds maximum execution time

## Error Handling

### Syntax Errors

```bash
python broken.py
# Error: SyntaxError at line 3: invalid syntax
```

### Runtime Errors

```bash
node error.js
# Error: ReferenceError at line 5: x is not defined
```

### Timeout

```bash
python infinite.py
# Error: Execution timed out after 5 seconds
```

## Security

All code execution is:
- **Sandboxed**: No access to real filesystem, network, or browser APIs
- **Isolated**: Cannot affect the main application
- **Time-limited**: Automatically terminated after 5 seconds
- **Client-side**: Nothing sent to any server

## Limitations

- No package imports (pip/npm)
- No file I/O (code sees mock filesystem only)
- No network requests
- No stdin/interactive input
- 5-second execution limit
- Not available in 3D terminal mode

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Terminal                        │
│  ┌─────────────┐         ┌─────────────┐        │
│  │ python cmd  │         │  node cmd   │        │
│  └──────┬──────┘         └──────┬──────┘        │
│         │                       │               │
│         ▼                       ▼               │
│  ┌─────────────┐         ┌─────────────┐        │
│  │  Pyodide    │         │ Web Worker  │        │
│  │  (WASM)     │         │ (Isolated)  │        │
│  └─────────────┘         └─────────────┘        │
│         │                       │               │
│         └───────────┬───────────┘               │
│                     ▼                           │
│              ┌─────────────┐                    │
│              │   Output    │                    │
│              │  Component  │                    │
│              └─────────────┘                    │
└─────────────────────────────────────────────────┘
```
