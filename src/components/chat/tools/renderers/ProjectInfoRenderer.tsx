import { ToolRendererProps, ProjectData } from '../types'
import { safeParse } from '../utils'
import { ProjectInfoCard } from '../../ProjectInfoCard'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

export function ProjectInfoRenderer({ tool, isActive }: ToolRendererProps) {
  const projectData = tool.result ? safeParse<ProjectData>(tool.result) : null

  if (isActive) {
    return <LoadingSkeleton message="Fetching project info..." variant="card" />
  }

  if (projectData && projectData.name) {
    return <ProjectInfoCard data={projectData} />
  }

  return <DefaultToolRenderer tool={tool} isActive={isActive} />
}

