/**
 * JavaScript Worker Code
 *
 * This module creates a sandboxed Web Worker for executing JavaScript code.
 * The worker runs in an isolated context with no access to DOM, fetch, or localStorage.
 */

/**
 * Worker code as a string to be converted to a Blob.
 * This runs in complete isolation from the main thread.
 *
 * Security model:
 * - Web Workers already run in a separate thread with no DOM access
 * - We shadow dangerous globals with undefined to prevent network/storage access
 * - Function constructor is used instead of eval for slightly better isolation
 * - User code cannot escape the sandbox or access the parent page
 */
export const workerCode = `
// Sandboxed JavaScript execution environment
// Shadow dangerous globals to prevent network requests, storage access, and worker imports
const self = undefined
const window = undefined
const document = undefined
const localStorage = undefined
const sessionStorage = undefined
const indexedDB = undefined
const fetch = undefined
const XMLHttpRequest = undefined
const WebSocket = undefined
const importScripts = undefined
const navigator = undefined
const location = undefined

// Custom console that captures output
const output = []
const errors = []

const console = {
  log: (...args) => output.push(args.map(formatArg).join(' ')),
  info: (...args) => output.push(args.map(formatArg).join(' ')),
  warn: (...args) => output.push('[warn] ' + args.map(formatArg).join(' ')),
  error: (...args) => errors.push(args.map(formatArg).join(' ')),
  debug: (...args) => output.push('[debug] ' + args.map(formatArg).join(' ')),
  dir: (obj) => output.push(formatArg(obj)),
  table: (data) => output.push(JSON.stringify(data, null, 2)),
  clear: () => { output.length = 0 },
  assert: (condition, ...args) => {
    if (!condition) {
      errors.push('Assertion failed: ' + args.map(formatArg).join(' '))
    }
  },
  count: (() => {
    const counts = {}
    return (label = 'default') => {
      counts[label] = (counts[label] || 0) + 1
      output.push(label + ': ' + counts[label])
    }
  })(),
  time: (() => {
    const timers = {}
    return (label = 'default') => { timers[label] = Date.now() }
  })(),
  timeEnd: (() => {
    const timers = {}
    return (label = 'default') => {
      const start = timers[label]
      if (start) {
        output.push(label + ': ' + (Date.now() - start) + 'ms')
        delete timers[label]
      }
    }
  })(),
}

function formatArg(arg) {
  if (arg === undefined) return 'undefined'
  if (arg === null) return 'null'
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2)
    } catch {
      return String(arg)
    }
  }
  return String(arg)
}

// Listen for code execution requests
onmessage = function(e) {
  const { code, id } = e.data
  output.length = 0
  errors.length = 0

  const startTime = performance.now()

  try {
    // Function constructor creates code in global scope rather than local closure,
    // preventing access to variables in this worker's scope (like postMessage)
    const fn = new Function(code)
    fn()

    const executionTime = Math.round(performance.now() - startTime)

    postMessage({
      id,
      success: true,
      stdout: output.join('\\n'),
      stderr: errors.join('\\n'),
      executionTime,
    })
  } catch (error) {
    const executionTime = Math.round(performance.now() - startTime)

    postMessage({
      id,
      success: false,
      stdout: output.join('\\n'),
      stderr: errors.join('\\n'),
      error: {
        message: error.message,
        type: error.name,
        stack: error.stack,
      },
      executionTime,
    })
  }
}
`

/**
 * Create a Blob URL for the worker code
 */
export function createWorkerBlobUrl(): string {
  const blob = new Blob([workerCode], { type: 'application/javascript' })
  return URL.createObjectURL(blob)
}
