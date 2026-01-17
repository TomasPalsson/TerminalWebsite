/**
 * Pyodide Loader
 *
 * Lazy-loads the Pyodide Python runtime from CDN.
 * Caches the instance for subsequent executions.
 */

// Pyodide types (simplified for our usage)
interface PyodideInterface {
  runPython(code: string): unknown
  runPythonAsync(code: string): Promise<unknown>
  globals: {
    get(name: string): unknown
    set(name: string, value: unknown): void
  }
  loadPackage(packages: string | string[]): Promise<void>
  FS: {
    readFile(path: string): Uint8Array
    writeFile(path: string, data: Uint8Array | string): void
  }
}

interface LoadPyodideOptions {
  indexURL?: string
  stdout?: (text: string) => void
  stderr?: (text: string) => void
}

declare global {
  interface Window {
    loadPyodide?: (options?: LoadPyodideOptions) => Promise<PyodideInterface>
  }
}

// Pyodide CDN URL
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'

let pyodidePromise: Promise<PyodideInterface> | null = null
let pyodideInstance: PyodideInterface | null = null
let isLoading = false

/**
 * Load the Pyodide script from CDN
 */
async function loadPyodideScript(): Promise<void> {
  if (window.loadPyodide) return

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${PYODIDE_CDN}pyodide.js`
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'))

    document.head.appendChild(script)
  })
}

/**
 * Initialize and return the Pyodide instance
 * Lazy-loads on first call, returns cached instance on subsequent calls
 */
export async function getPyodide(
  stdoutCallback?: (text: string) => void,
  stderrCallback?: (text: string) => void
): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance
  }

  if (pyodidePromise) {
    return pyodidePromise
  }

  isLoading = true

  pyodidePromise = (async () => {
    try {
      // Load the Pyodide script first
      await loadPyodideScript()

      if (!window.loadPyodide) {
        throw new Error('loadPyodide not available after script load')
      }

      // Initialize Pyodide with stdout/stderr capture
      const pyodide = await window.loadPyodide({
        indexURL: PYODIDE_CDN,
        stdout: stdoutCallback,
        stderr: stderrCallback,
      })

      pyodideInstance = pyodide
      isLoading = false
      return pyodide
    } catch (error) {
      isLoading = false
      pyodidePromise = null
      throw error
    }
  })()

  return pyodidePromise
}

/**
 * Check if Pyodide is currently loading
 */
export function isPyodideLoading(): boolean {
  return isLoading
}

/**
 * Check if Pyodide is ready
 */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null
}

/**
 * Reset Pyodide instance (for testing)
 */
export function resetPyodide(): void {
  pyodideInstance = null
  pyodidePromise = null
  isLoading = false
}
