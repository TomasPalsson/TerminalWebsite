import { useState } from 'react'
import { ChevronDown, ChevronRight, Zap, Code2, Wrench, Layers, Box } from 'lucide-react'
import { ToolRendererProps } from '../types'
import { safeParse } from '../utils'
import { getTechIcon } from '../icons'
import { LoadingSkeleton } from './LoadingSkeleton'
import { DefaultToolRenderer } from './DefaultToolRenderer'

// Skill level styling - can handle any level dynamically
const levelStyles: Record<string, { color: string; bg: string; border: string }> = {
  strong: { color: 'text-terminal', bg: 'bg-terminal/10', border: 'border-terminal/30' },
  familiar: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  learning: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  avoid: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  // Default for unknown levels
  default: { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
}

// Category icons
const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  languages: Code2,
  frameworks: Layers,
  tools: Wrench,
  default: Box,
}

function getStyle(level: string) {
  return levelStyles[level.toLowerCase()] || levelStyles.default
}

function getCategoryIcon(category: string) {
  return categoryIcons[category.toLowerCase()] || categoryIcons.default
}

function formatLabel(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

function SkillBadge({ skill, level }: { skill: string; level: string }) {
  const Icon = getTechIcon(skill)
  const style = getStyle(level)

  return (
    <div className={`
      flex items-center gap-1.5 px-2 py-1 rounded-md
      ${style.bg} border ${style.border}
      font-mono text-xs ${style.color}
      transition-all hover:scale-105
    `}>
      <Icon className="w-3 h-3" />
      <span>{skill}</span>
    </div>
  )
}

// Generic type for skills data - handles any structure
type DynamicSkillsData = Record<string, unknown>

// Check if value is a skill category (object with arrays)
function isSkillCategory(value: unknown): value is Record<string, string[]> {
  if (typeof value !== 'object' || value === null) return false
  const entries = Object.entries(value)
  return entries.length > 0 && entries.some(([, v]) => Array.isArray(v))
}

// Check if value is a tools-like object (has string/array properties)
function isToolsObject(value: unknown): value is Record<string, string | string[]> {
  if (typeof value !== 'object' || value === null) return false
  const entries = Object.entries(value)
  return entries.length > 0 && entries.every(([, v]) => typeof v === 'string' || Array.isArray(v))
}

export function AllSkillsRenderer({ tool, isActive }: ToolRendererProps) {
  const [expanded, setExpanded] = useState(false)
  const skillsData = tool.result ? safeParse<DynamicSkillsData>(tool.result) : null

  if (isActive) {
    return <LoadingSkeleton message="Loading skills..." variant="badges" />
  }

  if (!skillsData || typeof skillsData !== 'object') {
    return <DefaultToolRenderer tool={tool} isActive={isActive} />
  }

  // Count total skills dynamically
  const countAllSkills = () => {
    let count = 0
    for (const value of Object.values(skillsData)) {
      if (isSkillCategory(value)) {
        for (const arr of Object.values(value)) {
          if (Array.isArray(arr)) count += arr.length
        }
      }
    }
    return count
  }
  const totalSkills = countAllSkills()

  // Collapsed view
  if (!expanded) {
    return (
      <div className="my-2 not-prose">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={12} className="text-terminal/70" />
          <Zap size={12} className="text-terminal" />
          <span className="text-xs font-mono">Skills</span>
          <span className="text-terminal/60 text-xs">({totalSkills} skills)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="my-3 not-prose">
      {/* Header */}
      <button
        onClick={() => setExpanded(false)}
        className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-gray-400 transition-colors mb-3 px-1"
      >
        <ChevronDown size={12} className="text-terminal/70" />
        <Zap size={12} className="text-terminal" />
        <span>Skills</span>
      </button>

      {/* Card */}
      <div className="relative overflow-hidden rounded-lg border border-terminal/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950">
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/10 to-transparent" />
        </div>

        <div className="relative p-4 space-y-4">
          {/* Dynamically render all categories */}
          {Object.entries(skillsData).map(([category, value]) => {
            const CategoryIcon = getCategoryIcon(category)

            // Handle skill categories (languages, frameworks, etc.)
            if (isSkillCategory(value)) {
              const levels = Object.entries(value).filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
              if (levels.length === 0) return null

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <CategoryIcon size={12} className="text-terminal" />
                    <span>{formatLabel(category)}</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    {levels.map(([level, items]) => {
                      const style = getStyle(level)
                      return (
                        <div key={level} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
                            <span className={style.color}>{formatLabel(level)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(items as string[]).map((skill, idx) => (
                              <SkillBadge key={idx} skill={skill} level={level} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            // Handle tools-like objects (editor, version_control, cloud, etc.)
            if (isToolsObject(value)) {
              const entries = Object.entries(value).filter(([, v]) =>
                (typeof v === 'string' && v) || (Array.isArray(v) && v.length > 0)
              )
              if (entries.length === 0) return null

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <CategoryIcon size={12} className="text-terminal" />
                    <span>{formatLabel(category)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-1">
                    {entries.map(([key, val]) => {
                      if (typeof val === 'string') {
                        return <SkillBadge key={key} skill={val} level="strong" />
                      }
                      if (Array.isArray(val)) {
                        return val.map((item, idx) => (
                          <SkillBadge key={`${key}-${idx}`} skill={item} level="learning" />
                        ))
                      }
                      return null
                    })}
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>

        {/* Bottom accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-terminal/40 to-transparent" />
      </div>
    </div>
  )
}
