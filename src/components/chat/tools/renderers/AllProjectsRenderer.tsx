import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Layers } from 'lucide-react'
import { ToolRendererProps, ProjectsDict } from '../types'
import { safeParse } from '../utils'
import { ProjectInfoCard } from '../../ProjectInfoCard'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

export function AllProjectsRenderer({ tool, isActive }: ToolRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const projectsDict = tool.result ? safeParse<ProjectsDict>(tool.result) : null

  if (isActive) {
    return <LoadingSkeleton message="Loading projects..." variant="card" />
  }

  if (!projectsDict) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const projects = Object.values(projectsDict)
  if (projects.length === 0) {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  const currentProject = projects[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < projects.length - 1

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasPrev) setCurrentIndex(currentIndex - 1)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasNext) setCurrentIndex(currentIndex + 1)
  }

  // Collapsed view
  if (!expanded) {
    return (
      <div className="my-2 not-prose">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={12} className="text-terminal/70" />
          <Layers size={12} className="text-terminal" />
          <span className="text-xs font-mono">Projects</span>
          <span className="text-terminal/60 text-xs">({projects.length})</span>
        </button>
      </div>
    )
  }

  return (
    <div className="my-3 not-prose">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => setExpanded(false)}
          className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-400 transition-colors"
        >
          <ChevronDown size={12} className="text-terminal/70" />
          <Layers size={12} className="text-terminal" />
          <span>Projects</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Prev Button */}
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            className={`
              flex items-center justify-center w-7 h-7 rounded-md
              border transition-all duration-200
              ${hasPrev
                ? 'border-terminal/40 text-terminal hover:bg-terminal/10 active:scale-95'
                : 'border-neutral-700 text-neutral-600 cursor-not-allowed'
              }
            `}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page Indicator */}
          <div className="flex items-center gap-1.5 px-2">
            {projects.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${idx === currentIndex
                    ? 'bg-terminal scale-110'
                    : 'bg-neutral-600 hover:bg-neutral-500'
                  }
                `}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={!hasNext}
            className={`
              flex items-center justify-center w-7 h-7 rounded-md
              border transition-all duration-200
              ${hasNext
                ? 'border-terminal/40 text-terminal hover:bg-terminal/10 active:scale-95'
                : 'border-neutral-700 text-neutral-600 cursor-not-allowed'
              }
            `}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="text-right text-xs font-mono text-gray-600 mb-1 px-1">
        {currentIndex + 1} / {projects.length}
      </div>

      {/* Project Card */}
      <div className="relative">
        <ProjectInfoCard data={currentProject} />
      </div>
    </div>
  )
}

