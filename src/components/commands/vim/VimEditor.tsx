import React, { useEffect, useRef, useState, useCallback } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { vim, Vim, getCM } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import { VimEditorProps, VimMode } from './types'

// Dark theme matching terminal aesthetic
const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#000000',
    color: '#ffffff',
    height: '100%',
    fontSize: '14px',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    caretColor: '#22c55e',
    padding: '8px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#22c55e',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-gutters': {
    backgroundColor: '#000000',
    color: '#666666',
    border: 'none',
    borderRight: '1px solid #333333',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 16px',
  },
  '.cm-scroller': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    overflow: 'auto',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  // Vim fat cursor in normal mode
  '.cm-fat-cursor': {
    background: '#22c55e !important',
    color: '#000000 !important',
  },
  '.cm-cursor-primary': {
    background: '#22c55e',
  },
  '&.cm-focused': {
    outline: 'none',
  },
}, { dark: true })

/**
 * VimEditor component - A vim-like text editor using CodeMirror 6.
 * Supports basic vim keybindings, modes, and Ex commands.
 */
export function VimEditor({ filename, initialContent, onSave, onClose }: VimEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const [content, setContent] = useState(initialContent)
  const [currentFilename] = useState(filename)
  const [isModified, setIsModified] = useState(false)
  const [mode, setMode] = useState<VimMode>('normal')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Store callbacks in refs to avoid stale closures in Vim.defineEx
  const contentRef = useRef(content)
  const currentFilenameRef = useRef(currentFilename)
  const isModifiedRef = useRef(isModified)
  const cursorRef = useRef(cursor)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    currentFilenameRef.current = currentFilename
  }, [currentFilename])

  useEffect(() => {
    isModifiedRef.current = isModified
  }, [isModified])

  // Auto-focus the editor on mount
  useEffect(() => {
    const focusEditor = () => {
      if (editorRef.current?.view) {
        editorRef.current.view.focus()
      }
    }
    // Small delay to ensure CodeMirror is fully mounted
    const timer = setTimeout(focusEditor, 50)
    return () => clearTimeout(timer)
  }, [])

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  // Define Ex commands once on mount
  useEffect(() => {
    // :w - Write (save) file
    Vim.defineEx('write', 'w', () => {
      if (currentFilenameRef.current) {
        const result = onSave(currentFilenameRef.current, contentRef.current)
        if (result.success) {
          setIsModified(false)
          setStatusMessage(`"${currentFilenameRef.current}" written`)
        } else {
          setStatusMessage(result.error || 'Error writing file')
        }
      } else {
        setStatusMessage('E32: No file name')
      }
    })

    // :q - Quit (with :q! support via bang parameter)
    Vim.defineEx('quit', 'q', (_cm: any, params: { bang?: boolean }) => {
      // :q! - force quit without saving
      if (params?.bang) {
        onClose()
        return
      }
      // :q - quit only if no unsaved changes
      if (isModifiedRef.current) {
        setStatusMessage('E37: No write since last change (add ! to override)')
      } else {
        onClose()
      }
    })

    // :wq - Write and quit
    Vim.defineEx('wq', 'wq', () => {
      if (currentFilenameRef.current) {
        const result = onSave(currentFilenameRef.current, contentRef.current)
        if (result.success) {
          onClose()
        } else {
          setStatusMessage(result.error || 'Error writing file')
        }
      } else {
        setStatusMessage('E32: No file name')
      }
    })

    // :x - Write (if modified) and quit
    Vim.defineEx('x', 'x', () => {
      if (isModifiedRef.current && currentFilenameRef.current) {
        const result = onSave(currentFilenameRef.current, contentRef.current)
        if (result.success) {
          onClose()
        } else {
          setStatusMessage(result.error || 'Error writing file')
        }
      } else if (!isModifiedRef.current) {
        onClose()
      } else {
        setStatusMessage('E32: No file name')
      }
    })
  }, []) // Empty deps - only run once on mount

  // Track mode changes
  useEffect(() => {
    const checkMode = () => {
      if (editorRef.current?.view) {
        const cm = getCM(editorRef.current.view)
        if (cm && cm.state && cm.state.vim) {
          const vimState = cm.state.vim
          let newMode: VimMode = 'normal'
          if (vimState.insertMode) {
            newMode = 'insert'
          } else if (vimState.visualMode) {
            newMode = 'visual'
          } else if (vimState.replaceMode) {
            newMode = 'replace'
          }
          setMode(prev => prev !== newMode ? newMode : prev)
        }
      }
    }

    // Check mode periodically (vim mode changes aren't exposed via events)
    const interval = setInterval(checkMode, 100)
    return () => clearInterval(interval)
  }, [])

  // Handle content changes
  const handleChange = useCallback((value: string) => {
    setContent(value)
    setIsModified(true)
  }, [])

  // Track cursor position - only update if changed
  const handleUpdate = useCallback((viewUpdate: any) => {
    if (!viewUpdate.state?.selection?.main) return
    const pos = viewUpdate.state.selection.main.head
    const doc = viewUpdate.state.doc
    if (!doc) return

    const line = doc.lineAt(pos)
    const newLine = line.number
    const newColumn = pos - line.from + 1

    // Only update state if cursor actually moved
    if (cursorRef.current.line !== newLine || cursorRef.current.column !== newColumn) {
      cursorRef.current = { line: newLine, column: newColumn }
      setCursor({ line: newLine, column: newColumn })
    }
  }, [])

  // Mode display text
  const getModeDisplay = () => {
    switch (mode) {
      case 'insert': return '-- INSERT --'
      case 'visual': return '-- VISUAL --'
      case 'replace': return '-- REPLACE --'
      default: return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-black font-mono">
      {/* Editor */}
      <div className="flex-1 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto">
        <CodeMirror
          ref={editorRef}
          value={content}
          onChange={handleChange}
          onUpdate={handleUpdate}
          theme="dark"
          extensions={[
            vim(),
            darkTheme,
          ]}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightSelectionMatches: false,
            searchKeymap: false,
            tabSize: 2,
          }}
          className="h-full"
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-neutral-900 border-t border-neutral-800 text-xs shrink-0">
        {/* Left: Mode indicator */}
        <div className="flex items-center gap-4">
          <span className="text-terminal font-medium min-w-[100px]">
            {getModeDisplay()}
          </span>
          {statusMessage && (
            <span className="text-yellow-400">{statusMessage}</span>
          )}
        </div>

        {/* Right: File info and cursor position */}
        <div className="flex items-center gap-4 text-gray-500">
          <span>
            {currentFilename || '[No Name]'}
            {isModified && <span className="text-yellow-400 ml-1">[+]</span>}
          </span>
          <span>{cursor.line}:{cursor.column}</span>
        </div>
      </div>
    </div>
  )
}
