export type TabState = { prefix: string; candidates: string[]; index: number }

export type TabCompletion = {
  text: string
  suggestions: string[] | null
  tabState: TabState
}

type CompletionSource = {
  /** Argument being completed; keyed so repeated tabs cycle the same candidate list */
  prefix: string
  candidates: string[]
  /** Rebuilds the input line with the chosen completion substituted in */
  apply: (completion: string) => string
}

/** Longest common prefix of all candidates */
function longestCommonPrefix(candidates: string[]): string {
  return candidates.reduce((prev, curr) => {
    let p = prev
    while (p && !curr.startsWith(p)) p = p.slice(0, -1)
    return p
  }, candidates[0])
}

/**
 * First tab extends to the longest common prefix (or the first candidate);
 * later tabs for the same prefix cycle through the candidates.
 */
function step(source: CompletionSource, tabState: TabState | null): TabCompletion {
  const { prefix, candidates, apply } = source

  if (!tabState || tabState.prefix !== prefix) {
    const lcp = longestCommonPrefix(candidates)
    const completion = lcp && lcp.length > prefix.length ? lcp : candidates[0]
    return {
      text: apply(completion),
      suggestions: candidates.length > 1 ? candidates : null,
      tabState: { prefix, candidates, index: candidates.length === 1 ? 0 : -1 },
    }
  }

  const index = tabState.index === -1 ? 0 : (tabState.index + 1) % tabState.candidates.length
  return {
    text: apply(tabState.candidates[index]),
    suggestions: tabState.candidates,
    tabState: { ...tabState, index },
  }
}

export type CompletionOptions = {
  /** Commands whose arguments are filesystem paths */
  fsCommands: string[]
  commandNames: string[]
  getPathCompletions: (prefix: string) => string[]
}

/**
 * Completes the current input line. Returns null when there is nothing to complete.
 */
export function completeInput(
  current: string,
  tabState: TabState | null,
  { fsCommands, commandNames, getPathCompletions }: CompletionOptions
): TabCompletion | null {
  if (!current) return null
  const [first, ...rest] = current.split(/\s+/)
  if (!first) return null

  if (fsCommands.includes(first) && rest.length > 0) {
    // Use the current argument as prefix so "projects/" completes into "projects/README.md"
    const prefix = rest[rest.length - 1] || ''
    const candidates =
      tabState && tabState.prefix === prefix ? tabState.candidates : getPathCompletions(prefix)
    if (!candidates.length) return null
    return step(
      { prefix, candidates, apply: (c) => [first, ...rest.slice(0, -1), c].join(' ') },
      tabState
    )
  }

  const prefix = tabState?.prefix ?? first
  const candidates =
    tabState && tabState.prefix === prefix
      ? tabState.candidates
      : commandNames.filter((c) => c.startsWith(prefix))
  if (!candidates.length) return null
  return step({ prefix, candidates, apply: (c) => [c, ...rest].join(' ') }, tabState)
}
