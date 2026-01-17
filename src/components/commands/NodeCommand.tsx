import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { fileSystem } from '../../services/filesystem'
import { getJavaScriptExecutor } from '../../services/executor/JavaScriptExecutor'
import { isValidExtension } from '../../services/executor'
import { ExecutionOutput } from '../ExecutionOutput'
import { Terminal, AlertCircle } from 'lucide-react'

/**
 * NodeCommand - Execute JavaScript files in a sandboxed environment
 *
 * Usage:
 *   node <filename.js>  - Execute a JavaScript file
 *   node                - Show usage help
 */
export const NodeCommand: Command = {
  name: 'node',
  description: 'Execute JavaScript files',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">node &lt;filename&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Executes JavaScript files in a secure sandboxed environment.
        Code runs entirely in your browser with no network access.
      </p>
      <p className="text-terminal mb-2">Supported Extensions:</p>
      <p className="text-gray-400 mb-3">.js, .mjs</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">node app.js</span> — Execute app.js</p>
        <p><span className="text-white">node scripts/test.mjs</span> — Execute test.mjs</p>
      </div>
      <p className="text-terminal mt-4 mb-2">Limitations:</p>
      <div className="space-y-1 text-gray-400 text-xs">
        <p>• No npm/require - single file execution only</p>
        <p>• No network access (fetch, XMLHttpRequest blocked)</p>
        <p>• No filesystem access (mock filesystem only)</p>
        <p>• 5 second execution timeout</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    // Check if in 3D terminal mode
    if (context.headless) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">node is not available in 3D terminal mode</p>
          <p className="text-gray-500 mt-1">
            Switch to <span className="text-terminal">2D Mode</span> to execute code
          </p>
        </div>
      )
    }

    // Show help if no filename provided
    if (!args[0]) {
      return (
        <div className="font-mono text-sm">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={16} className="text-terminal" />
            <span className="text-white">node - JavaScript Execution</span>
          </div>
          <p className="text-gray-400 mb-2">Execute JavaScript files in a secure sandbox.</p>
          <p className="text-gray-500">
            Usage: <span className="text-terminal">node &lt;filename.js&gt;</span>
          </p>
        </div>
      )
    }

    fileSystem.initialize()
    const filename = args[0]
    const resolvedPath = fileSystem.resolvePath(filename)

    // Validate file extension
    const executor = getJavaScriptExecutor()
    if (!isValidExtension(resolvedPath, executor.fileExtensions)) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">
              Unsupported file type. Expected: .js or .mjs
            </span>
          </div>
        </div>
      )
    }

    // Check if file exists
    const fileResult = fileSystem.cat(resolvedPath)
    if (!fileResult.success) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">No such file: {filename}</span>
          </div>
        </div>
      )
    }

    const code = fileResult.data || ''

    // Handle empty file
    if (!code.trim()) {
      return (
        <ExecutionOutput
          result={{
            success: true,
            stdout: '',
            stderr: '',
            executionTime: 0,
            timedOut: false,
          }}
          filename={resolvedPath}
        />
      )
    }

    // Execute the code
    try {
      await executor.initialize()
      const result = await executor.execute(code)
      return <ExecutionOutput result={result} filename={resolvedPath} />
    } catch (error) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">
              Execution failed: {error instanceof Error ? error.message : 'Unknown error'}
            </span>
          </div>
        </div>
      )
    }
  },
}
