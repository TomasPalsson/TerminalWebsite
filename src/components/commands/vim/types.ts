/**
 * TypeScript types for the Vim Editor component.
 */

/**
 * Vim editor modes supported by the editor.
 */
export type VimMode = 'normal' | 'insert' | 'visual' | 'replace'

/**
 * Props for the VimEditor component.
 */
export interface VimEditorProps {
  /** Initial filename (null for new buffer) */
  filename: string | null
  /** Initial content to load into the editor */
  initialContent: string
  /** Callback when user saves file via :w command */
  onSave: (filename: string, content: string) => { success: boolean; error?: string }
  /** Callback when user exits editor via :q command */
  onClose: () => void
}

/**
 * Internal state managed by the VimEditor component.
 */
export interface VimEditorState {
  /** Current filename (can change via :w newname) */
  filename: string | null
  /** Whether buffer has unsaved changes */
  isModified: boolean
  /** Current vim mode for status display */
  mode: VimMode
  /** Current cursor position */
  cursor: {
    line: number
    column: number
  }
  /** Status message to display (e.g., "File saved", "E32: No file name") */
  statusMessage: string | null
}
