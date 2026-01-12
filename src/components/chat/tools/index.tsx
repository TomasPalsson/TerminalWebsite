/**
 * Tool Renderer System
 *
 * A modular, extensible system for rendering tool call results in the chat.
 *
 * Structure:
 * - types.ts       - Shared TypeScript types
 * - utils.ts       - Shared utilities (parsing, formatting)
 * - icons.ts       - Tech/skill icon mappings
 * - registry.ts    - Tool renderer registry
 * - renderers/     - Individual renderer components
 *
 * To add a new tool renderer:
 * 1. Create a file in ./renderers/ (copy an existing one as template)
 * 2. Add your renderer to the array in registry.ts
 * 3. That's it! The system auto-registers it.
 */

export * from './types'
export * from './utils'
export { getTechIcon, techIconMap } from './icons'
export { toolRendererRegistry, hasCustomRenderer, getRenderer } from './registry'

// Main ToolRenderer component
import { ToolRendererProps } from './types'
import { getRenderer } from './registry'
import { DefaultToolRenderer } from './renderers/DefaultToolRenderer'

export function ToolRenderer({ tool, isActive }: ToolRendererProps) {
  const CustomRenderer = getRenderer(tool.tool)

  if (CustomRenderer) {
    return <CustomRenderer tool={tool} isActive={isActive} />
  }

  return <DefaultToolRenderer tool={tool} isActive={isActive} />
}
