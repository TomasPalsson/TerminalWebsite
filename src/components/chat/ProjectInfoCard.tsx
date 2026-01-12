import { useState } from 'react'
import { FaGithub, FaRust, FaReact, FaPython, FaAws, FaDocker, FaNodeJs, FaJava } from 'react-icons/fa'
import { FaDartLang, FaFlutter } from 'react-icons/fa6'
import { SiOpenai, SiTypescript, SiTailwindcss, SiPostgresql, SiMongodb, SiFirebase, SiKotlin, SiSwift, SiGo, SiCplusplus } from 'react-icons/si'
import { TbBrandThreejs } from 'react-icons/tb'
import { ExternalLink, Sparkles, Code2, CheckCircle2, Clock, Wrench } from 'lucide-react'

type ProjectData = {
  name: string
  tech: string[]
  description: string
  github?: string
  highlights?: string[]
  status?: string
}

// Map tech names to icons
const techIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'flutter': FaFlutter,
  'dart': FaDartLang,
  'openai': SiOpenai,
  'openai api': SiOpenai,
  'rust': FaRust,
  'react': FaReact,
  'python': FaPython,
  'aws': FaAws,
  'threejs': TbBrandThreejs,
  'three.js': TbBrandThreejs,
  'docker': FaDocker,
  'node': FaNodeJs,
  'nodejs': FaNodeJs,
  'node.js': FaNodeJs,
  'typescript': SiTypescript,
  'tailwind': SiTailwindcss,
  'tailwindcss': SiTailwindcss,
  'postgresql': SiPostgresql,
  'postgres': SiPostgresql,
  'mongodb': SiMongodb,
  'firebase': SiFirebase,
  'kotlin': SiKotlin,
  'swift': SiSwift,
  'go': SiGo,
  'golang': SiGo,
  'java': FaJava,
  'c++': SiCplusplus,
  'cpp': SiCplusplus,
}

function getTechIcon(tech: string) {
  const normalizedTech = tech.toLowerCase().trim()
  return techIconMap[normalizedTech] || Code2
}

function getStatusConfig(status?: string) {
  const normalizedStatus = status?.toLowerCase() || ''

  if (normalizedStatus.includes('active') || normalizedStatus.includes('develop')) {
    return {
      icon: Wrench,
      label: 'In Development',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      pulse: true
    }
  }
  if (normalizedStatus.includes('complete') || normalizedStatus.includes('done')) {
    return {
      icon: CheckCircle2,
      label: 'Completed',
      color: 'text-terminal',
      bg: 'bg-terminal/10',
      border: 'border-terminal/30',
      pulse: false
    }
  }
  if (normalizedStatus.includes('pause') || normalizedStatus.includes('hold')) {
    return {
      icon: Clock,
      label: 'On Hold',
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      border: 'border-gray-400/30',
      pulse: false
    }
  }

  return {
    icon: Sparkles,
    label: status || 'Active',
    color: 'text-terminal',
    bg: 'bg-terminal/10',
    border: 'border-terminal/30',
    pulse: false
  }
}

export function ProjectInfoCard({ data }: { data: ProjectData }) {
  const [isHovered, setIsHovered] = useState(false)
  const statusConfig = getStatusConfig(data.status)
  const StatusIcon = statusConfig.icon

  return (
    <div
      className="my-3 not-prose"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-lg border transition-all duration-300
        ${isHovered
          ? 'border-terminal/60 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
          : 'border-terminal/30'
        }
        bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950
      `}>
        {/* Animated corner accent */}
        <div className={`
          absolute top-0 right-0 w-20 h-20 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-50'}
        `}>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-terminal/20 to-transparent" />
        </div>

        {/* Header */}
        <div className="relative p-4 pb-3 border-b border-neutral-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-mono text-lg font-bold text-white truncate">
                {data.name}
              </h3>

              {/* Status badge */}
              <div className={`
                inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-xs font-mono
                ${statusConfig.bg} ${statusConfig.border} border
              `}>
                <StatusIcon
                  size={12}
                  className={`${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`}
                />
                <span className={statusConfig.color}>{statusConfig.label}</span>
              </div>
            </div>

            {/* GitHub link */}
            {data.github && (
              <a
                href={data.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs
                  border border-terminal/40 text-terminal
                  hover:bg-terminal hover:text-black transition-all duration-200
                  group
                `}
              >
                <FaGithub size={14} />
                <span className="hidden sm:inline">View</span>
                <ExternalLink size={10} className="opacity-60 group-hover:opacity-100" />
              </a>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="font-mono text-sm text-gray-300 leading-relaxed">
            {data.description}
          </p>

          {/* Tech Stack */}
          {data.tech && data.tech.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <Code2 size={12} />
                <span>Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.tech.map((tech, idx) => {
                  const Icon = getTechIcon(tech)
                  return (
                    <div
                      key={idx}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1 rounded-md
                        bg-neutral-800/80 border border-neutral-700
                        font-mono text-xs text-gray-300
                        hover:border-terminal/40 hover:text-terminal transition-colors
                      `}
                    >
                      <Icon className="text-terminal/70" />
                      <span>{tech}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Highlights */}
          {data.highlights && data.highlights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <Sparkles size={12} />
                <span>Highlights</span>
              </div>
              <ul className="space-y-1.5">
                {data.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 font-mono text-xs text-gray-400"
                  >
                    <span className="text-terminal mt-0.5">▸</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className={`
          h-0.5 bg-gradient-to-r from-transparent via-terminal/50 to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-30'}
        `} />
      </div>
    </div>
  )
}
