import React from 'react'
import { ChevronRight } from 'lucide-react'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { visible } from '@/services/profile'
import type { Project, Profile } from '@/types/profile'
import { TECH_ICONS } from './techIcons'

function ProjectBullets({ bullets }: { bullets: string[] }) {
  return (
    <div className="mt-2 space-y-1.5">
      {bullets.map((bullet, i) => (
        <p key={i} className="font-mono text-sm text-gray-400 leading-relaxed">
          {bullet}
        </p>
      ))}
    </div>
  )
}

function ProjectStack({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {stack.map((name, i) => {
        const Icon = TECH_ICONS[name]
        return (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700"
          >
            {Icon && <Icon className="text-terminal" />}
            <span className="font-mono text-xs text-gray-400">{name}</span>
          </div>
        )
      })}
    </div>
  )
}

function ProjectFeatures({ features }: { features?: string[] }) {
  if (!features || features.length === 0) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-terminal shrink-0" />
          <span className="font-mono text-xs text-gray-500">{feature}</span>
        </div>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
      <div className="relative p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-mono text-xl font-medium text-white">{project.name.en}</h3>
            {project.tagline?.en && (
              <p className="font-mono text-xs text-gray-500 mt-1">{project.tagline.en}</p>
            )}
            <ProjectBullets bullets={project.bullets.en} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.name.en}`}
                title={new URL(project.link).hostname}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/50 transition shrink-0"
              >
                <FaExternalLinkAlt size={18} />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/50 transition shrink-0"
              >
                <FaGithub size={20} />
              </a>
            )}
          </div>
        </div>
        <ProjectStack stack={project.stack} />
        <ProjectFeatures features={project.features} />
      </div>
    </div>
  )
}

export function ProjectsTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {visible(profile.projects).map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  )
}
