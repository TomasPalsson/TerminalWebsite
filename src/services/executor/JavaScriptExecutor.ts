/**
 * JavaScript Executor
 *
 * Executes JavaScript code in a sandboxed Web Worker.
 * Provides timeout enforcement and output capture.
 */

import { CodeExecutor, ExecutionResult, ExecutionOptions } from '../../types/executor'
import {
  DEFAULT_EXECUTION_OPTIONS,
  createSuccessResult,
  createErrorResult,
  createTimeoutResult,
  parseJavaScriptError,
  truncateOutput,
} from './index'
import { createWorkerBlobUrl } from './jsWorker'

export class JavaScriptExecutor implements CodeExecutor {
  readonly language = 'javascript'
  readonly fileExtensions = ['.js', '.mjs']

  private worker: Worker | null = null
  private workerUrl: string | null = null
  private pendingExecution: {
    resolve: (result: ExecutionResult) => void
    timeoutId: ReturnType<typeof setTimeout>
  } | null = null

  get isReady(): boolean {
    return this.worker !== null
  }

  get isLoading(): boolean {
    return false // Worker creation is instant
  }

  async initialize(): Promise<void> {
    if (this.worker) return

    this.workerUrl = createWorkerBlobUrl()
    this.worker = new Worker(this.workerUrl)

    this.worker.onmessage = (e) => {
      if (this.pendingExecution) {
        const { resolve, timeoutId } = this.pendingExecution
        clearTimeout(timeoutId)
        this.pendingExecution = null

        const { success, stdout, stderr, error, executionTime } = e.data

        if (success) {
          resolve(createSuccessResult(stdout, stderr, executionTime))
        } else {
          resolve(createErrorResult(
            parseJavaScriptError(error),
            stdout,
            stderr,
            executionTime
          ))
        }
      }
    }

    this.worker.onerror = (e) => {
      if (this.pendingExecution) {
        const { resolve, timeoutId } = this.pendingExecution
        clearTimeout(timeoutId)
        this.pendingExecution = null

        resolve(createErrorResult(
          { message: e.message || 'Worker error', type: 'WorkerError' },
          '',
          '',
          0
        ))
      }
    }
  }

  async execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    const opts = { ...DEFAULT_EXECUTION_OPTIONS, ...options }

    if (!this.worker) {
      await this.initialize()
    }

    return new Promise((resolve) => {
      const id = Date.now()

      // Set up timeout with worker termination
      // Unlike Pyodide, Web Workers can be forcefully terminated to stop infinite loops
      const timeoutId = setTimeout(() => {
        if (this.pendingExecution) {
          this.pendingExecution = null
          // Terminate stuck worker and create fresh one for next execution
          this.terminate()
          this.initialize()
          resolve(createTimeoutResult('', '', opts.timeout))
        }
      }, opts.timeout)

      this.pendingExecution = { resolve, timeoutId }

      this.worker!.postMessage({ code, id })
    })
  }

  terminate(): void {
    if (this.pendingExecution) {
      clearTimeout(this.pendingExecution.timeoutId)
      this.pendingExecution = null
    }

    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl)
      this.workerUrl = null
    }
  }
}

// Singleton instance
let instance: JavaScriptExecutor | null = null

export function getJavaScriptExecutor(): JavaScriptExecutor {
  if (!instance) {
    instance = new JavaScriptExecutor()
  }
  return instance
}
