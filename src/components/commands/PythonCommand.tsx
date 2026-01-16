import React from 'react'
import { Command } from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { fileSystem } from '../../services/filesystem'
import { getPythonExecutor } from '../../services/executor/PythonExecutor'
import { isValidExtension } from '../../services/executor'
import { ExecutionOutput } from '../ExecutionOutput'
import { Terminal, AlertCircle, Loader2 } from 'lucide-react'

/**
 * PythonCommand - Execute Python files using Pyodide (WebAssembly)
 *
 * Usage:
 *   python <filename.py>  - Execute a Python file
 *   python                - Show usage help
 */
export const PythonCommand: Command = {
  name: 'python',
  description: 'Execute Python files',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">python &lt;filename&gt;</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400 mb-3">
        Executes Python files using Pyodide (Python in WebAssembly).
        Code runs entirely in your browser with no network access.
      </p>
      <p className="text-terminal mb-2">Supported Extensions:</p>
      <p className="text-gray-400 mb-3">.py</p>
      <p className="text-terminal mb-2">Examples:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">python script.py</span> — Execute script.py</p>
        <p><span className="text-white">python scripts/hello.py</span> — Execute hello.py</p>
      </div>
      <p className="text-terminal mt-4 mb-2">Note:</p>
      <div className="space-y-1 text-gray-400 text-xs">
        <p>• First run loads Pyodide (~15MB) - subsequent runs are instant</p>
        <p>• Standard library available (math, json, re, etc.)</p>
        <p>• No pip/external packages</p>
        <p>• No network access</p>
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
          <p className="text-red-400">python is not available in 3D terminal mode</p>
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
            <span className="text-white">python - Python Execution</span>
          </div>
          <p className="text-gray-400 mb-2">Execute Python files using Pyodide (WebAssembly).</p>
          <p className="text-gray-500">
            Usage: <span className="text-terminal">python &lt;filename.py&gt;</span>
          </p>
        </div>
      )
    }

    fileSystem.initialize()
    const filename = args[0]
    const resolvedPath = fileSystem.resolvePath(filename)

    // Validate file extension
    const executor = getPythonExecutor()
    if (!isValidExtension(resolvedPath, executor.fileExtensions)) {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">
              Unsupported file type. Expected: .py
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
      // Show loading indicator if Pyodide needs to be loaded
      if (!executor.isReady && !executor.isLoading) {
        // Initialize will trigger the loading
      }

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
