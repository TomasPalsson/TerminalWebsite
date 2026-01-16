import React from 'react'
import { ExecutionResult } from '../types/executor'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface ExecutionOutputProps {
  result: ExecutionResult
  filename: string
}

/**
 * ExecutionOutput component
 *
 * Displays the result of code execution with appropriate styling
 * for success, errors, and timeouts.
 */
export function ExecutionOutput({ result, filename }: ExecutionOutputProps) {
  const { success, stdout, stderr, error, executionTime, timedOut } = result

  return (
    <div className="font-mono text-sm">
      <div className="rounded-lg bg-neutral-900/50 border border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-800">
          {timedOut ? (
            <Clock size={14} className="text-yellow-400" />
          ) : success ? (
            <CheckCircle size={14} className="text-terminal" />
          ) : (
            <XCircle size={14} className="text-red-400" />
          )}
          <span className="text-gray-400 text-xs">{filename}</span>
          <span className="ml-auto text-[10px] text-gray-600">
            {executionTime < 1000
              ? `${executionTime}ms`
              : `${(executionTime / 1000).toFixed(1)}s`}
          </span>
        </div>

        {/* Output */}
        <div className="p-4 space-y-2">
          {/* Stdout */}
          {stdout && (
            <pre className="text-gray-300 whitespace-pre-wrap break-words">
              {stdout}
            </pre>
          )}

          {/* Stderr (warnings) */}
          {stderr && !error && (
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <pre className="whitespace-pre-wrap break-words">{stderr}</pre>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded bg-red-500/10 border border-red-500/30 p-3">
              <div className="flex items-start gap-2">
                <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  {error.type && (
                    <span className="text-red-400 font-medium">{error.type}</span>
                  )}
                  {error.line && (
                    <span className="text-gray-500 text-xs ml-2">
                      at line {error.line}
                      {error.column && `:${error.column}`}
                    </span>
                  )}
                  <p className="text-red-300 mt-1">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeout message */}
          {timedOut && (
            <div className="rounded bg-yellow-500/10 border border-yellow-500/30 p-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-yellow-400" />
                <span className="text-yellow-300">
                  Execution timed out after {executionTime / 1000} seconds
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Your code may contain an infinite loop or long-running operation.
              </p>
            </div>
          )}

          {/* No output message */}
          {!stdout && !stderr && !error && !timedOut && (
            <p className="text-gray-500 italic">No output</p>
          )}
        </div>
      </div>
    </div>
  )
}
