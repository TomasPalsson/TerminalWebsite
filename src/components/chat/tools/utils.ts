// Convert Python dict string to JSON parseable string
export function pythonToJson(pythonStr: string): string {
  // Handle escaped quotes first (\" in the input)
  let result = pythonStr

  // Replace Python True/False/None
  result = result
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')

  // Smart quote replacement: only replace single quotes used as string delimiters
  // This regex matches single quotes that are at string boundaries, not apostrophes
  // Pattern: replace ' at start/end of strings, after/before : , [ ] { }
  result = result
    .replace(/(?<=[\[{:,])\s*'/g, ' "')  // Opening quotes after delimiters
    .replace(/'\s*(?=[\]}:,])/g, '"')     // Closing quotes before delimiters
    .replace(/^\s*'/g, '"')               // Opening quote at start
    .replace(/'\s*$/g, '"')               // Closing quote at end

  return result
}

// Safe parse that handles both JSON and Python dict strings
export function safeParse<T>(str: string): T | null {
  if (!str) return null

  try {
    return JSON.parse(str) as T
  } catch {
    try {
      const jsonStr = pythonToJson(str)
      return JSON.parse(jsonStr) as T
    } catch {
      return null
    }
  }
}

// Format tool name for display
export function formatToolName(tool: string): string {
  let name = tool.replace(/_exa$/, '').replace(/^exa_/, '')
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
