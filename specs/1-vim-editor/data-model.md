# Data Model: Vim Editor

## Entities

### VimEditorProps

Props for the VimEditor React component.

```typescript
interface VimEditorProps {
  /** Initial filename (null for new buffer) */
  filename: string | null
  /** Initial content to load */
  initialContent: string
  /** Callback when user saves file */
  onSave: (filename: string, content: string) => void
  /** Callback when user exits editor */
  onClose: () => void
  /** Callback for unsaved changes warning */
  onQuitWithChanges?: () => boolean
}
```

### VimEditorState

Internal state managed by the VimEditor component.

```typescript
interface VimEditorState {
  /** Current filename (can change via :w newname) */
  filename: string | null
  /** Whether buffer has unsaved changes */
  isModified: boolean
  /** Current vim mode for status display */
  mode: 'normal' | 'insert' | 'visual' | 'command'
  /** Current cursor position */
  cursor: {
    line: number
    column: number
  }
  /** Error/info message to display in status bar */
  statusMessage: string | null
}
```

### VimMode

Enum for vim modes (subset of full vim modes).

```typescript
type VimMode = 'normal' | 'insert' | 'command'
```

Note: Visual mode exists in the underlying library but is out of scope for our feature.

## Relationships

```
┌─────────────────┐         ┌──────────────────┐
│   VimCommand    │────────>│    VimEditor     │
│  (terminal cmd) │ spawns  │   (component)    │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ uses
                                     ▼
                            ┌──────────────────┐
                            │   fileSystem     │
                            │    (service)     │
                            └──────────────────┘
```

## State Transitions

### Vim Mode State Machine

```
                    ┌───────────────────────────────────────┐
                    │                                       │
                    ▼                                       │
              ┌──────────┐                                  │
    ─────────>│  NORMAL  │<─────────────────────────┐      │
    (start)   └────┬─────┘                          │      │
                   │                                │      │
         ┌─────────┼──────────┐                     │      │
         │ i,a,o,O │          │ :                   │      │
         ▼         │          ▼                     │      │
    ┌──────────┐   │    ┌──────────┐                │      │
    │  INSERT  │   │    │ COMMAND  │                │      │
    └────┬─────┘   │    └────┬─────┘                │      │
         │         │         │                      │      │
         │ Escape  │         │ Enter/Escape         │      │
         └─────────┴─────────┴──────────────────────┘      │
                                                           │
                   :q or :wq closes editor ────────────────┘
```

### Editor Lifecycle

```
1. vim <filename>
   ├── filename exists?
   │   ├── YES: Load content from fileSystem
   │   └── NO: Start with empty buffer, mark as new file
   │
2. User edits
   └── Any change sets isModified = true

3. User saves (:w)
   ├── filename set?
   │   ├── YES: Save to fileSystem, isModified = false
   │   └── NO: Show "No filename" error
   │
4. User quits (:q)
   ├── isModified?
   │   ├── YES: Show "Unsaved changes" warning
   │   └── NO: Close editor, return to terminal
   │
5. User force quits (:q!)
   └── Close editor without saving

6. User save-quits (:wq)
   └── Save then close
```

## Integration Points

### With FileSystem Service

```typescript
// Reading files
const content = fileSystem.readFile(resolvedPath)
if (content.success) {
  // Load content.content into editor
} else {
  // Start with empty buffer for new file
}

// Writing files
const result = fileSystem.writeFile(resolvedPath, editorContent)
if (!result.success) {
  // Show error in status bar
}
```

### With Terminal Context

The VimEditor component replaces the terminal view when active. The terminal needs to:
1. Track whether vim is open
2. Pass focus to VimEditor when open
3. Resume normal terminal operation when vim closes
