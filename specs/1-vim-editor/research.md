# Research: Vim Editor Feature

## Package Selection

### Decision: Use `@uiwjs/react-codemirror` with `@replit/codemirror-vim`

**Rationale:**
- `@uiwjs/react-codemirror` is a mature, high-reputation React wrapper for CodeMirror 6 (404 code snippets, High reputation)
- `@replit/codemirror-vim` provides battle-tested vim keybindings used in production at Replit
- Both packages are actively maintained (updated Feb 2025)
- Native TypeScript support
- Full vim motion support including w/b/e word motions out of the box

**Alternatives Considered:**
1. `react-vim-wasm` - Full Vim via WebAssembly, but requires SharedArrayBuffer (browser compatibility issues)
2. `react-vimjs` - Older, less maintained
3. Custom implementation - Too much effort for basic keybindings; would need to implement all motions manually

## Integration Pattern

### Decision: Custom Ex Commands via `Vim.defineEx()`

**Rationale:**
The `@replit/codemirror-vim` package provides a `Vim.defineEx()` API to define custom Ex commands:

```javascript
Vim.defineEx('write', 'w', function() {
  // save the file to mock filesystem
});

Vim.defineEx('quit', 'q', function() {
  // close editor, return to terminal
});
```

This allows us to hook `:w`, `:q`, `:wq`, and `:q!` into our mock filesystem without modifying the library.

**Alternatives Considered:**
1. Fork the library - Unnecessary; defineEx provides all needed hooks
2. Intercept keystrokes - Error-prone; better to use official API

## Editor State Management

### Decision: React state + CodeMirror view instance

**Rationale:**
- Use React state for: filename, modified status, isOpen
- Use CodeMirror's internal state for: buffer content, cursor position, mode
- Access CodeMirror state via `getCM(view)` when needed for integration

**Key Integration Points:**
1. On `:w` - Extract content from CodeMirror, save to `fileSystem.writeFile()`
2. On `:q` - Check modified status, close editor component
3. On load - Read from `fileSystem.readFile()`, initialize CodeMirror with content

## Styling Integration

### Decision: CSS variables for theming

**Rationale:**
CodeMirror 6 uses CSS custom properties that we can override to match our terminal theme:
- Background: `--cm-background: #000` (black)
- Text: `--cm-color: #fff` (white)
- Cursor/accents: `--cm-cursor: #22c55e` (terminal green)

The `@uiwjs/react-codemirror` package supports theme extensions.

## Command Registration

### Decision: VimCommand in CommandMap following existing patterns

**Rationale:**
Following constitution Principle 2 (Extensibility), the vim command will:
1. Create `VimCommand.tsx` implementing the `Command` interface
2. Register in `CommandMap.tsx`
3. Return a `VimEditor` component that takes over the terminal view

This matches how other commands work but introduces a "fullscreen" editor mode.

## Dependencies to Install

```bash
npm install @uiwjs/react-codemirror @replit/codemirror-vim @codemirror/state @codemirror/view
```

**Peer Dependencies (may already exist):**
- react >= 16.8
- react-dom >= 16.8

## Key Code Patterns

### Basic Setup (from Replit docs)

```typescript
import CodeMirror from '@uiwjs/react-codemirror'
import { vim, Vim } from '@replit/codemirror-vim'

// Define Ex commands before rendering
Vim.defineEx('write', 'w', () => { /* save */ })
Vim.defineEx('quit', 'q', () => { /* quit */ })
Vim.defineEx('wq', 'wq', () => { /* save and quit */ })

function VimEditor({ filename, onSave, onClose }) {
  return (
    <CodeMirror
      value={initialContent}
      extensions={[vim()]}  // vim() must come first
      onChange={(value) => { /* track changes */ }}
    />
  )
}
```

### Important Notes

1. **Extension order matters**: `vim()` must be listed before other keymaps
2. **drawSelection required**: If not using basicSetup, include drawSelection for visual mode
3. **Mode indicator**: CodeMirror vim extension manages mode internally; we can access via `cm.state.vim.mode`
