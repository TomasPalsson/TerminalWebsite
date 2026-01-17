# Research: Safe Browser Code Execution

## Research Tasks Completed

### 1. Pyodide Integration Best Practices

**Decision**: Use Pyodide v0.24+ loaded from official CDN with lazy initialization

**Rationale**:
- Pyodide is the most mature Python-in-browser solution
- CDN loading avoids bundling 15MB+ into the application
- Lazy loading ensures first page load isn't blocked
- v0.24+ includes improved performance and security features

**Alternatives Considered**:
- **Brython**: Transpiles Python to JS, but limited stdlib and different semantics
- **Skulpt**: Educational focus, incomplete Python implementation
- **RustPython WASM**: Less mature, fewer packages supported

**Implementation Notes**:
```javascript
// Lazy load pattern
let pyodidePromise = null;
async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });
  }
  return pyodidePromise;
}
```

### 2. JavaScript Web Worker Sandboxing

**Decision**: Use inline Blob-based Web Worker with restricted scope

**Rationale**:
- No external file needed (avoids CORS and path issues)
- Worker cannot access DOM, localStorage, or main thread globals
- `postMessage` provides clean communication channel
- Can be terminated forcibly for timeout enforcement

**Alternatives Considered**:
- **iframe sandbox**: More overhead, harder to communicate with
- **vm2/isolated-vm**: Node.js only, not browser compatible
- **SES (Secure ECMAScript)**: Complex setup, overkill for this use case

**Security Restrictions Applied**:
```javascript
// Worker code blocks these by default:
// - window, document, localStorage, sessionStorage
// - fetch, XMLHttpRequest (not exposed to worker scope in our setup)
// - importScripts (disabled by CSP or code structure)
```

### 3. Timeout Implementation Strategy

**Decision**: Use Promise.race with Worker termination

**Rationale**:
- JavaScript: `worker.terminate()` immediately kills execution
- Python: Pyodide's `interruptExecution()` API for clean cancellation
- Promise.race pattern provides clean timeout abstraction

**Implementation Pattern**:
```javascript
async function executeWithTimeout(executeFn, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Execution timed out')), timeout)
  );
  return Promise.race([executeFn(), timeoutPromise]);
}
```

### 4. Output Capture Strategy

**Decision**: Override stdout/stderr for Python, wrap console for JavaScript

**Rationale**:
- Python: Pyodide allows redirecting `sys.stdout` and `sys.stderr`
- JavaScript: Intercept `console.log/error/warn` in worker scope
- Both approaches capture all user output without modification

**Python Output Capture**:
```python
import sys
from io import StringIO

stdout_capture = StringIO()
stderr_capture = StringIO()
sys.stdout = stdout_capture
sys.stderr = stderr_capture
```

**JavaScript Output Capture**:
```javascript
const output = [];
const console = {
  log: (...args) => output.push({ type: 'log', args }),
  error: (...args) => output.push({ type: 'error', args }),
  warn: (...args) => output.push({ type: 'warn', args }),
};
```

### 5. Error Handling and Line Numbers

**Decision**: Parse native error messages to extract line/column info

**Rationale**:
- Python tracebacks include line numbers naturally
- JavaScript errors include stack traces with line numbers
- Parsing provides consistent error format across languages

**Error Format Normalization**:
- Extract line number from traceback/stack
- Provide original error message
- Include error type (SyntaxError, TypeError, etc.)

## Security Checklist

| Threat | Mitigation | Status |
|--------|------------|--------|
| Infinite loops | 5-second timeout with forced termination | ✅ |
| Memory exhaustion | Browser WASM limits + output line cap | ✅ |
| Network access | Workers have no fetch/XHR by design | ✅ |
| Filesystem access | Only mock filesystem exposed | ✅ |
| DOM manipulation | Workers cannot access DOM | ✅ |
| Cross-origin attacks | No external script loading | ✅ |
| Prototype pollution | Isolated execution context | ✅ |

## Performance Benchmarks (Expected)

| Operation | Target | Notes |
|-----------|--------|-------|
| Pyodide cold start | < 10s | First load, CDN download |
| Pyodide warm start | < 500ms | Runtime cached |
| Python execution | < 2s | Simple scripts |
| JS Worker creation | < 50ms | Blob-based |
| JS execution | < 100ms | Simple scripts |

## Resolved Clarifications

All technical unknowns have been resolved through research. No NEEDS CLARIFICATION markers remain.
