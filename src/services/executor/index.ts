/**
 * Executor Service Utilities
 *
 * Shared utilities for code execution including timeout handling,
 * output truncation, and error parsing.
 */

import {
  ExecutionResult,
  ExecutionOptions,
  ErrorInfo,
  DEFAULT_EXECUTION_OPTIONS,
} from '../../types/executor'

export { DEFAULT_EXECUTION_OPTIONS }

/**
 * Execute a function with a timeout
 * @param fn - Async function to execute
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves with result or rejects on timeout
 */
export async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number
): Promise<{ result: T; timedOut: false } | { result: null; timedOut: true }> {
  let timeoutId: ReturnType<typeof setTimeout>

  const timeoutPromise = new Promise<{ result: null; timedOut: true }>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ result: null, timedOut: true })
    }, timeout)
  })

  const executionPromise = fn().then((result) => {
    clearTimeout(timeoutId)
    return { result, timedOut: false as const }
  })

  return Promise.race([executionPromise, timeoutPromise])
}

/**
 * Truncate output to max lines
 * @param output - Output string to truncate
 * @param maxLines - Maximum number of lines
 * @returns Truncated output with indicator if truncated
 */
export function truncateOutput(output: string, maxLines: number): string {
  const lines = output.split('\n')
  if (lines.length <= maxLines) {
    return output
  }
  return lines.slice(0, maxLines).join('\n') + `\n... (truncated ${lines.length - maxLines} lines)`
}

/**
 * Parse JavaScript error to extract line/column info
 * @param error - Error object or string
 * @returns Parsed error info
 */
export function parseJavaScriptError(error: Error | string): ErrorInfo {
  const errorStr = error instanceof Error ? error.stack || error.message : String(error)
  const message = error instanceof Error ? error.message : String(error)
  const type = error instanceof Error ? error.name : 'Error'

  // Try to extract line number from stack trace
  // Format: "at <anonymous>:2:5" or "eval:2:5"
  const lineMatch = errorStr.match(/<anonymous>:(\d+):(\d+)/) ||
                    errorStr.match(/eval:(\d+):(\d+)/) ||
                    errorStr.match(/:(\d+):(\d+)/)

  return {
    message,
    type,
    line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    column: lineMatch ? parseInt(lineMatch[2], 10) : undefined,
  }
}

/**
 * Parse Python error to extract line/column info
 * @param error - Error string from Python traceback
 * @returns Parsed error info
 */
export function parsePythonError(error: string): ErrorInfo {
  // Python traceback format:
  // File "<exec>", line 3
  //   SyntaxError: invalid syntax
  const lineMatch = error.match(/line (\d+)/)
  const typeMatch = error.match(/(\w+Error):\s*(.+)/)

  return {
    message: typeMatch ? typeMatch[2] : error.split('\n').pop() || error,
    type: typeMatch ? typeMatch[1] : 'Error',
    line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
  }
}

/**
 * Create a successful execution result
 */
export function createSuccessResult(
  stdout: string,
  stderr: string,
  executionTime: number,
  options: ExecutionOptions = {}
): ExecutionResult {
  const opts = { ...DEFAULT_EXECUTION_OPTIONS, ...options }
  return {
    success: true,
    stdout: truncateOutput(stdout, opts.maxOutputLines),
    stderr: truncateOutput(stderr, opts.maxOutputLines),
    executionTime,
    timedOut: false,
  }
}

/**
 * Create a failed execution result
 */
export function createErrorResult(
  error: ErrorInfo,
  stdout: string,
  stderr: string,
  executionTime: number
): ExecutionResult {
  return {
    success: false,
    stdout,
    stderr,
    error,
    executionTime,
    timedOut: false,
  }
}

/**
 * Create a timeout execution result
 */
export function createTimeoutResult(
  stdout: string,
  stderr: string,
  timeout: number
): ExecutionResult {
  return {
    success: false,
    stdout,
    stderr,
    error: {
      message: `Execution timed out after ${timeout / 1000} seconds`,
      type: 'TimeoutError',
    },
    executionTime: timeout,
    timedOut: true,
  }
}

/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/)
  return match ? `.${match[1].toLowerCase()}` : ''
}

/**
 * Check if file extension is valid for an executor
 */
export function isValidExtension(path: string, validExtensions: string[]): boolean {
  const ext = getFileExtension(path)
  return validExtensions.includes(ext)
}
