import { ToolRendererComponent } from './types'
import { ProjectInfoRenderer } from './renderers/ProjectInfoRenderer'
import { AllProjectsRenderer } from './renderers/AllProjectsRenderer'
import { AllSkillsRenderer } from './renderers/AllSkillsRenderer'
import { WebSearchRenderer } from './renderers/WebSearchRenderer'
import { GitHubUserRenderer } from './renderers/GitHubUserRenderer'
import { GitHubRepoRenderer } from './renderers/GitHubRepoRenderer'
import { GitHubIssueRenderer } from './renderers/GitHubIssueRenderer'
import { GitHubPRRenderer } from './renderers/GitHubPRRenderer'
import { GitHubCodeSearchRenderer } from './renderers/GitHubCodeSearchRenderer'

/**
 * Tool Renderer Registry
 *
 * To add a new tool renderer:
 * 1. Create a new file in ./renderers/ (e.g., MyToolRenderer.tsx)
 * 2. Export your component with the ToolRendererProps signature
 * 3. Import it here and add to the registry below
 *
 * Example:
 * ```tsx
 * // renderers/WeatherRenderer.tsx
 * export function WeatherRenderer({ tool, isActive }: ToolRendererProps) {
 *   // ... your rendering logic
 * }
 *
 * // Then add to registry:
 * 'get_weather': WeatherRenderer,
 * ```
 */

// Tool name -> Renderer component mapping
export const toolRendererRegistry: Record<string, ToolRendererComponent> = {
  // Portfolio tools
  'get_project_info': ProjectInfoRenderer,
  'get_all_projects': AllProjectsRenderer,
  'get_all_skills': AllSkillsRenderer,

  // Web search
  'exa_web_search_exa': WebSearchRenderer,

  // GitHub - User
  'github_get_me': GitHubUserRenderer,
  'github_search_users': GitHubUserRenderer,

  // GitHub - Repositories
  'github_search_repositories': GitHubRepoRenderer,
  'github_list_branches': GitHubRepoRenderer,
  'github_list_tags': GitHubRepoRenderer,
  'github_list_releases': GitHubRepoRenderer,
  'github_get_latest_release': GitHubRepoRenderer,
  'github_get_release_by_tag': GitHubRepoRenderer,

  // GitHub - Issues
  'github_list_issues': GitHubIssueRenderer,
  'github_issue_read': GitHubIssueRenderer,
  'github_search_issues': GitHubIssueRenderer,

  // GitHub - Pull Requests
  'github_list_pull_requests': GitHubPRRenderer,
  'github_pull_request_read': GitHubPRRenderer,
  'github_search_pull_requests': GitHubPRRenderer,

  // GitHub - Code Search
  'github_search_code': GitHubCodeSearchRenderer,
}

// Helper to check if a tool has a custom renderer
export function hasCustomRenderer(toolName: string): boolean {
  return toolName in toolRendererRegistry
}

// Get renderer for a tool (returns undefined if no custom renderer)
export function getRenderer(toolName: string): ToolRendererComponent | undefined {
  return toolRendererRegistry[toolName]
}
