import React from 'react'
import { Command } from '../Command'
import { KeyPressContextType } from '../../../context/KeypressedContext'
import { fileSystem } from '../../../services/filesystem'
import { FileText } from 'lucide-react'

/**
 * VimCommand - Opens the vim editor for creating or editing files.
 *
 * Usage:
 *   vim [filename]  - Open file for editing (creates if doesn't exist)
 *   vim             - Open empty buffer
 */
export const VimCommand: Command = {
  name: 'vim',
  description: 'Edit files with vim',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">vim [filename]</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Opens a vim-like text editor for creating and editing files.
        Files are saved to the mock filesystem.
      </p>
      <p className="text-terminal mb-2">Basic Commands:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">i</span> — Enter INSERT mode</p>
        <p><span className="text-white">Escape</span> — Return to NORMAL mode</p>
        <p><span className="text-white">:w</span> — Save file</p>
        <p><span className="text-white">:q</span> — Quit (fails if unsaved changes)</p>
        <p><span className="text-white">:wq</span> — Save and quit</p>
        <p><span className="text-white">:q!</span> — Force quit without saving</p>
      </div>
      <p className="text-terminal mb-2">Navigation:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">h/j/k/l</span> — Move left/down/up/right</p>
        <p><span className="text-white">w/b/e</span> — Word motions</p>
        <p><span className="text-white">0/$</span> — Start/end of line</p>
        <p><span className="text-white">gg/G</span> — First/last line</p>
      </div>
      <p className="text-terminal mb-2">Editing:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">x</span> — Delete character</p>
        <p><span className="text-white">dd</span> — Delete line</p>
        <p><span className="text-white">yy</span> — Copy line</p>
        <p><span className="text-white">p</span> — Paste</p>
        <p><span className="text-white">u</span> — Undo</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    // Vim is not supported in 3D terminal mode
    if (context.headless) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">vim is not available in 3D terminal mode</p>
          <p className="text-gray-500 mt-1">
            Switch to <span className="text-terminal">2D Mode</span> to use the vim editor
          </p>
        </div>
      )
    }

    fileSystem.initialize()

    const filename = args[0] || null
    let initialContent = ''
    let resolvedPath: string | null = null

    // If filename provided, try to load existing content
    if (filename) {
      resolvedPath = fileSystem.resolvePath(filename)
      const result = fileSystem.cat(resolvedPath)
      if (result.success && result.data !== undefined) {
        initialContent = result.data
      }
      // If file doesn't exist, we start with empty content (new file)
    }

    // Handle save callback
    const handleSave = (name: string, content: string) => {
      const path = fileSystem.resolvePath(name)
      const result = fileSystem.writeFile(path, content)
      return result
    }

    // Open vim editor via context
    if (context.setVimEditor) {
      context.setVimEditor({
        filename: resolvedPath,
        initialContent,
        onSave: handleSave,
        onClose: () => {
          // This will be overridden by Terminal.tsx to setVimEditor(null)
        },
      })
    }

    // Return a brief message (will be shown momentarily before editor opens)
    return (
      <div className="font-mono text-sm">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <FileText size={14} className="text-terminal" />
          <span>Opening {resolvedPath || 'new buffer'}...</span>
        </div>
      </div>
    )
  },
}
