# Quickstart: Vim Editor Implementation

## Prerequisites

- Node.js 18+
- Existing terminal portfolio codebase
- Understanding of React hooks and CodeMirror 6

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install @uiwjs/react-codemirror @replit/codemirror-vim @codemirror/state @codemirror/view
```

### 2. Create Directory Structure

```bash
mkdir -p src/components/commands/vim
```

## Implementation Order

### Step 1: Types (types.ts)

```typescript
// src/components/commands/vim/types.ts
export interface VimEditorProps {
  filename: string | null
  initialContent: string
  onSave: (filename: string, content: string) => void
  onClose: () => void
}

export type VimMode = 'normal' | 'insert' | 'command'
```

### Step 2: Theme (vimTheme.ts)

```typescript
// src/components/commands/vim/vimTheme.ts
import { EditorView } from '@codemirror/view'

export const vimTheme = EditorView.theme({
  '&': {
    backgroundColor: '#000',
    color: '#fff',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'JetBrains Mono, monospace',
    caretColor: '#22c55e',
  },
  '.cm-cursor': {
    borderLeftColor: '#22c55e',
  },
  '.cm-activeLine': {
    backgroundColor: '#111',
  },
  '.cm-gutters': {
    backgroundColor: '#000',
    color: '#666',
    border: 'none',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
})
```

### Step 3: Editor Component (VimEditor.tsx)

```typescript
// src/components/commands/vim/VimEditor.tsx
import React, { useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiwjs/react-codemirror'
import { vim, Vim } from '@replit/codemirror-vim'
import { vimTheme } from './vimTheme'
import { VimEditorProps, VimMode } from './types'

export function VimEditor({ filename, initialContent, onSave, onClose }: VimEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isModified, setIsModified] = useState(false)
  const [mode, setMode] = useState<VimMode>('normal')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Define Ex commands
  useEffect(() => {
    Vim.defineEx('write', 'w', () => {
      if (filename) {
        onSave(filename, content)
        setIsModified(false)
        setStatusMessage(`"${filename}" written`)
      } else {
        setStatusMessage('E32: No file name')
      }
    })

    Vim.defineEx('quit', 'q', () => {
      if (isModified) {
        setStatusMessage('E37: No write since last change')
      } else {
        onClose()
      }
    })

    Vim.defineEx('wq', 'wq', () => {
      if (filename) {
        onSave(filename, content)
        onClose()
      }
    })

    // ... more Ex commands
  }, [filename, content, isModified, onSave, onClose])

  return (
    <div className="flex flex-col h-full bg-black">
      <CodeMirror
        value={content}
        extensions={[vim(), vimTheme]}
        onChange={(value) => {
          setContent(value)
          setIsModified(true)
        }}
        className="flex-1"
      />
      {/* Status bar */}
      <div className="flex justify-between px-2 py-1 font-mono text-xs border-t border-neutral-800">
        <span className="text-terminal">{mode.toUpperCase()}</span>
        <span className="text-gray-500">
          {filename || '[No Name]'} {isModified && '[+]'}
        </span>
      </div>
    </div>
  )
}
```

### Step 4: Command (VimCommand.tsx)

```typescript
// src/components/commands/vim/VimCommand.tsx
import React from 'react'
import { Command } from '../Command'
import { VimEditor } from './VimEditor'
import { fileSystem } from '../../../services/filesystem'

export const VimCommand: Command = {
  name: 'vim',
  description: 'Edit files with vim',
  args: [],
  run: async (args) => {
    const filename = args[0] || null
    let initialContent = ''

    if (filename) {
      const result = fileSystem.readFile(filename)
      if (result.success) {
        initialContent = result.content
      }
    }

    // Return editor component (terminal handles mounting)
    return (
      <VimEditor
        filename={filename}
        initialContent={initialContent}
        onSave={(name, content) => fileSystem.writeFile(name, content)}
        onClose={() => { /* signal terminal to close editor */ }}
      />
    )
  },
}
```

### Step 5: Register Command

```typescript
// In CommandMap.tsx, add:
import { VimCommand } from './vim/VimCommand'
commandMap.set(VimCommand.name, VimCommand)
```

## Testing Checklist

```bash
# In terminal:
vim test.txt      # Opens editor
# Press i          # Enter insert mode
# Type content
# Press Escape     # Return to normal mode
# Type :wq         # Save and quit
cat test.txt      # Verify content saved
```

## Common Issues

1. **Keybindings not working**: Ensure `vim()` is first in extensions array
2. **Visual mode selection invisible**: Include `drawSelection` plugin if not using basicSetup
3. **Theme not applying**: Check that vimTheme is included in extensions
