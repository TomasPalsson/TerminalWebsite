/**
 * Code Executor Type Definitions
 *
 * Defines types for the safe browser-based code execution system.
 * Used by JavaScript (Web Worker) and Python (Pyodide) executors.
 */

/**
 * Error information from code execution
 */
export interface ErrorInfo {
  /** Human-readable error message */
  message: string
  /** Error type (e.g., SyntaxError, TypeError, ReferenceError) */
  type?: string
  /** Line number where error occurred (1-indexed) */
  line?: number
  /** Column number where error occurred (1-indexed) */
  column?: number
}

/**
 * Result of executing code
 */
export interface ExecutionResult {
  /** Whether execution completed without errors */
  success: boolean
  /** Captured standard output */
  stdout: string
  /** Captured standard error */
  stderr: string
  /** Error details if execution failed */
  error?: ErrorInfo
  /** Time taken to execute in milliseconds */
  executionTime: number
  /** Whether execution was terminated due to timeout */
  timedOut: boolean
}

/**
 * Configuration options for code execution
 */
export interface ExecutionOptions {
  /** Maximum execution time in milliseconds (default: 5000) */
  timeout?: number
  /** Maximum lines of output to capture (default: 1000) */
  maxOutputLines?: number
}

/**
 * Language executor interface
 *
 * Implementations must:
 * - Run code in an isolated sandbox (no DOM, network, or filesystem access)
 * - Capture stdout/stderr from executed code
 * - Enforce timeout limits
 * - Provide meaningful error messages with line numbers when possible
 */
export interface CodeExecutor {
  /** Language identifier (e.g., 'python', 'javascript') */
  readonly language: string

  /** File extensions this executor handles (e.g., ['.py'], ['.js', '.mjs']) */
  readonly fileExtensions: string[]

  /** Whether the executor runtime is loaded and ready */
  readonly isReady: boolean

  /** Whether the executor is currently loading */
  readonly isLoading: boolean

  /**
   * Initialize the executor runtime
   * @returns Promise that resolves when ready
   * @throws Error if initialization fails
   */
  initialize(): Promise<void>

  /**
   * Execute code and return the result
   * @param code - Source code to execute
   * @param options - Execution configuration
   * @returns Promise with execution result
   */
  execute(code: string, options?: ExecutionOptions): Promise<ExecutionResult>

  /**
   * Forcibly terminate any running execution
   */
  terminate(): void
}

/**
 * Default execution options
 */
export const DEFAULT_EXECUTION_OPTIONS: Required<ExecutionOptions> = {
  timeout: 5000,
  maxOutputLines: 1000,
}
