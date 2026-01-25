/**
 * Python Executor
 *
 * Executes Python code using Pyodide (Python in WebAssembly).
 * Provides timeout enforcement, output capture, and sandboxing.
 */

import { CodeExecutor, ExecutionResult, ExecutionOptions } from '../../types/executor'
import {
  DEFAULT_EXECUTION_OPTIONS,
  createSuccessResult,
  createErrorResult,
  createTimeoutResult,
  parsePythonError,
} from './index'
import { getPyodide, isPyodideLoading, isPyodideReady } from './pyodideLoader'

export class PythonExecutor implements CodeExecutor {
  readonly language = 'python'
  readonly fileExtensions = ['.py']

  private stdoutBuffer: string[] = []
  private stderrBuffer: string[] = []

  get isReady(): boolean {
    return isPyodideReady()
  }

  get isLoading(): boolean {
    return isPyodideLoading()
  }

  async initialize(): Promise<void> {
    // Initialize with output capture
    await getPyodide(
      (text) => this.stdoutBuffer.push(text),
      (text) => this.stderrBuffer.push(text)
    )
  }

  async execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    const opts = { ...DEFAULT_EXECUTION_OPTIONS, ...options }

    // Clear output buffers
    this.stdoutBuffer = []
    this.stderrBuffer = []

    const startTime = performance.now()

    try {
      const pyodide = await getPyodide(
        (text) => this.stdoutBuffer.push(text),
        (text) => this.stderrBuffer.push(text)
      )

      // Wrap execution with timeout protection
      // NOTE: This timeout is best-effort - runPython is synchronous and blocks
      // the main thread. The timeout will only trigger if the code yields control
      // (which Python code rarely does). True infinite loop protection would require
      // running Pyodide in a Web Worker, but that adds complexity.
      const executeWithTimeout = async (): Promise<ExecutionResult> => {
        return new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            resolve(createTimeoutResult(
              this.stdoutBuffer.join('\n'),
              this.stderrBuffer.join('\n'),
              opts.timeout
            ))
          }, opts.timeout)

          try {
            pyodide.runPython(code)

            clearTimeout(timeoutId)
            const executionTime = Math.round(performance.now() - startTime)

            resolve(createSuccessResult(
              this.stdoutBuffer.join('\n'),
              this.stderrBuffer.join('\n'),
              executionTime,
              opts
            ))
          } catch (error) {
            clearTimeout(timeoutId)
            const executionTime = Math.round(performance.now() - startTime)
            const errorStr = error instanceof Error ? error.message : String(error)

            resolve(createErrorResult(
              parsePythonError(errorStr),
              this.stdoutBuffer.join('\n'),
              this.stderrBuffer.join('\n'),
              executionTime
            ))
          }
        })
      }

      return await executeWithTimeout()
    } catch (error) {
      const executionTime = Math.round(performance.now() - startTime)
      const errorStr = error instanceof Error ? error.message : String(error)

      return createErrorResult(
        parsePythonError(errorStr),
        this.stdoutBuffer.join('\n'),
        this.stderrBuffer.join('\n'),
        executionTime
      )
    }
  }

  terminate(): void {
    // Pyodide runs in the main thread and cannot be forcefully terminated
    // Unlike the JS executor which uses Web Workers, we can only clear buffers
    // Infinite loops will block the main thread until timeout completes
    this.stdoutBuffer = []
    this.stderrBuffer = []
  }
}

// Singleton instance
let instance: PythonExecutor | null = null

export function getPythonExecutor(): PythonExecutor {
  if (!instance) {
    instance = new PythonExecutor()
  }
  return instance
}
