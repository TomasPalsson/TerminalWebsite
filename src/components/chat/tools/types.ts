import React from 'react'

export type ToolCall = {
  tool: string
  input?: Record<string, unknown>
  result?: string
  status?: 'running' | 'success' | 'error'
}

export type ToolRendererProps = {
  tool: ToolCall
  isActive: boolean
}

export type ToolRendererComponent = React.ComponentType<ToolRendererProps>

// Project types
export type ProjectData = {
  name: string
  tech: string[]
  description: string
  github?: string
  highlights?: string[]
  status?: string
}

export type ProjectsDict = Record<string, ProjectData>

// Skills types
export type SkillLevel = 'strong' | 'familiar' | 'learning' | 'avoid'

export type SkillsData = {
  languages?: {
    strong?: string[]
    familiar?: string[]
    learning?: string[]
    avoid?: string[]
  }
  frameworks?: {
    strong?: string[]
    familiar?: string[]
    learning?: string[]
    avoid?: string[]
  }
  tools?: {
    editor?: string
    preferences?: string[]
    version_control?: string
    cloud?: string[]
  }
  preferences?: {
    likes?: string[]
    dislikes?: string[]
  }
}
