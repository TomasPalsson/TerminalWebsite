'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { vim, Vim, getCM } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { VimEditorProps, VimMode } from './types'

// Language support imports
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { rust } from '@codemirror/lang-rust'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'

// Map file extensions to language support
function getLanguageExtension(filename: string | null): Extension | null {
  if (!filename) return null
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return null

  switch (ext) {
    case 'py':
      return python()
    case 'js':
    case 'mjs':
      return javascript()
    case 'ts':
      return javascript({ typescript: true })
    case 'jsx':
      return javascript({ jsx: true })
    case 'tsx':
      return javascript({ jsx: true, typescript: true })
    case 'json':
      return json()
    case 'md':
      return markdown()
    case 'html':
    case 'htm':
      return html()
    case 'css':
      return css()
    case 'rs':
      return rust()
    case 'java':
      return java()
    case 'c':
    case 'h':
      return cpp()
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
      return cpp()
    default:
      return null
  }
}

// Dark theme matching terminal aesthetic with syntax highlighting
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// Syntax highlighting colors
const syntaxColors = HighlightStyle.define([
  { tag: tags.keyword, color: '#c792ea' },           // purple for keywords
  { tag: tags.operator, color: '#89ddff' },          // cyan for operators
  { tag: tags.special(tags.variableName), color: '#eeffff' },
  { tag: tags.typeName, color: '#ffcb6b' },          // yellow for types
  { tag: tags.atom, color: '#f78c6c' },              // orange for atoms/booleans
  { tag: tags.number, color: '#f78c6c' },            // orange for numbers
  { tag: tags.definition(tags.variableName), color: '#82aaff' }, // blue for definitions
  { tag: tags.string, color: '#c3e88d' },            // green for strings
  { tag: tags.special(tags.string), color: '#c3e88d' },
  { tag: tags.comment, color: '#676e95', fontStyle: 'italic' }, // gray italic for comments
  { tag: tags.variableName, color: '#eeffff' },      // white for variables
  { tag: tags.function(tags.variableName), color: '#82aaff' }, // blue for functions
  { tag: tags.labelName, color: '#f07178' },         // red for labels
  { tag: tags.className, color: '#ffcb6b' },         // yellow for classes
  { tag: tags.definition(tags.propertyName), color: '#82aaff' },
  { tag: tags.propertyName, color: '#eeffff' },
  { tag: tags.meta, color: '#ffcb6b' },
  { tag: tags.tagName, color: '#f07178' },           // red for HTML tags
  { tag: tags.attributeName, color: '#c792ea' },    // purple for attributes
  { tag: tags.attributeValue, color: '#c3e88d' },   // green for attribute values
  { tag: tags.self, color: '#f07178' },              // red for self/this
  { tag: tags.bool, color: '#f78c6c' },              // orange for booleans
  { tag: tags.null, color: '#f78c6c' },              // orange for null
  { tag: tags.regexp, color: '#c3e88d' },            // green for regex
  { tag: tags.escape, color: '#89ddff' },            // cyan for escape sequences
  { tag: tags.bracket, color: '#89ddff' },           // cyan for brackets
])

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#000000',
    color: '#eeffff',
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
  // Matching bracket highlight
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
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
  // Ex commands are defined once on mount, so they capture initial state
  // Using refs ensures they always access current values
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Vim.defineEx('quit', 'q', (_cm: any, params: any) => {
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

  // Track mode changes via polling
  // WORKAROUND: codemirror-vim doesn't expose mode change events, so we poll
  // the internal vim state to update our status bar display
  useEffect(() => {
    const checkMode = () => {
      if (editorRef.current?.view) {
        const cm = getCM(editorRef.current.view)
        if (cm && cm.state && cm.state.vim) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const vimState = cm.state.vim as any
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

    // 100ms polling is a reasonable trade-off between responsiveness and CPU usage
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

  // Memoize extensions to avoid recreating on every render
  const extensions = useMemo(() => {
    const exts: Extension[] = [
      vim(),
      darkTheme,
      syntaxHighlighting(syntaxColors),
    ]

    // Add language support based on filename
    const langExt = getLanguageExtension(currentFilename)
    if (langExt) {
      exts.push(langExt)
    }

    return exts
  }, [currentFilename])

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
          extensions={extensions}
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
