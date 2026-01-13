import React from 'react'
import { KeyPressContextType } from "../../context/KeypressedContext"
import Command from './Command'
import { FaDartLang, FaFlutter, FaGithub } from 'react-icons/fa6'
import { FaRust, FaAws, FaReact, FaPython } from 'react-icons/fa'
import { TbBrandThreejs } from 'react-icons/tb'
import { SiOpenai } from 'react-icons/si'
import { ExternalLink, Folder, ChevronRight } from 'lucide-react'

type Project = {
  id: number
  name: string
  tagline: string
  description: string
  tech: { icon: React.ReactNode; name: string }[]
  features: string[]
  github: string
}

const projects: Project[] = [
  {
    id: 1,
    name: 'Canvas App',
    tagline: 'A Canvas LMS client application built with Flutter',
    description: 'A custom wrapper for the university\'s learning platform with AI-powered features. It lets users do everything the default app supports — plus extras like AI chat, smart flashcards, and task management that the official app doesn\'t offer.',
    tech: [
      { icon: <FaFlutter />, name: 'Flutter' },
      { icon: <FaDartLang />, name: 'Dart' },
      { icon: <SiOpenai />, name: 'OpenAI' },
    ],
    features: [
      'Calendar View',
      'View/interact with your courses',
      'View your assignments',
      'Use AI to plan your assignments',
      'Chat with your course material using AI',
      'Create flashcards from your course material using AI',
    ],
    github: 'https://github.com/TomasPalsson/canvas_app',
  },
  {
    id: 2,
    name: 'Language Compiler',
    tagline: 'A compiler for a custom programming language',
    description: 'A simple programming language in Rust that compiles to assembly binary code. Built from scratch with lexer, parser, and code generator.',
    tech: [
      { icon: <FaRust />, name: 'Rust' },
    ],
    features: [
      'Full function definitions and calls',
      'Local variable declarations and assignments',
      'Integer and string literals',
      'While loops and if-else conditionals',
      'Printing to stdout',
      'Arithmetic: +, -, *, /',
      'Comparisons: ==, !=, <, >',
    ],
    github: 'https://github.com/TomasPalsson/Language-Compiler',
  },
  {
    id: 3,
    name: 'Personal Website',
    tagline: 'This website with a 3D terminal and tools',
    description: 'Interactive terminal-themed portfolio with LLM-powered tools. Includes a CV viewer, chat bot, URL shortener and idea generator. Hosted on AWS with a Lambda backend.',
    tech: [
      { icon: <FaReact />, name: 'React' },
      { icon: <TbBrandThreejs />, name: 'Three.js' },
      { icon: <FaPython />, name: 'Python' },
      { icon: <FaAws />, name: 'AWS' },
    ],
    features: [
      '3D terminal interface',
      'View CV through commands',
      'Chat with AI',
      'URL shortener',
      'Idea generator',
    ],
    github: 'https://github.com/TomasPalsson/TerminalWebsite',
  },
]

const ProjectCard = ({ project, onClick }: { project: Project; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) => (
  <button
    type="button"
    onClick={(e) => onClick(e)}
    className="w-full text-left p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-terminal/50 hover:bg-neutral-900 transition group"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Folder size={14} className="text-terminal" />
          <span className="font-medium text-white">{project.name}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-1">{project.tagline}</p>
      </div>
      <ChevronRight size={16} className="text-gray-600 group-hover:text-terminal transition mt-1" />
    </div>
    <div className="flex items-center gap-2 mt-3">
      {project.tech.map((t, i) => (
        <span key={i} className="text-gray-500 text-sm">{t.icon}</span>
      ))}
    </div>
  </button>
)

const ProjectDetail = ({ project, context }: { project: Project; context: KeyPressContextType }) => (
  <div className="font-mono text-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-terminal/10 border border-terminal/30">
        <Folder size={16} className="text-terminal" />
      </div>
      <div>
        <h2 className="font-medium text-white">{project.name}</h2>
        <p className="text-xs text-terminal">{project.tagline}</p>
      </div>
    </div>

    <p className="text-gray-400 mb-4 leading-relaxed">{project.description}</p>

    <div className="flex flex-wrap gap-2 mb-4">
      {project.tech.map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs text-gray-400"
        >
          {t.icon}
          <span>{t.name}</span>
        </span>
      ))}
    </div>

    <div className="mb-4">
      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Features</p>
      <ul className="space-y-1">
        {project.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-400">
            <span className="text-terminal mt-0.5">•</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-terminal/10 border border-terminal/30 text-terminal hover:bg-terminal/20 transition text-sm"
        onClick={(e) => e.currentTarget.blur()}
      >
        <FaGithub size={14} />
        <span>View on GitHub</span>
        <ExternalLink size={12} className="text-terminal/60" />
      </a>
      <button
        type="button"
        onClick={(e) => {
          const cmd = 'projects'
          context?.setText(cmd)
          context?.setCursorPos(cmd.length)
          e.currentTarget.blur()
        }}
        className="text-xs text-gray-500 hover:text-gray-400 transition"
      >
        ← Back to all projects
      </button>
    </div>
  </div>
)

export const ProjectsCommand: Command = {
  name: "projects",
  description: "List of my projects",
  args: ["--github", "--detail"],
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">projects [options] [project_number]</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">-d, --detail [n]</span> — Show project details</p>
        <p><span className="text-white">-g, --github [n]</span> — Open project on GitHub</p>
      </div>
    </div>
  ),
  run: async (args: string[], context: KeyPressContextType) => {
    // Handle --detail or -d
    if (args[0] === '--detail' || args[0] === '-d') {
      const projectNum = parseInt(args[1])
      const project = projects.find(p => p.id === projectNum)

      if (!project) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">Project not found: {args[1] || '(no number provided)'}</p>
            <p className="text-gray-500 mt-1">Available: 1-{projects.length}</p>
          </div>
        )
      }

      return <ProjectDetail project={project} context={context} />
    }

    // Handle --github or -g
    if (args[0] === '--github' || args[0] === '-g') {
      const projectNum = parseInt(args[1])
      const project = projects.find(p => p.id === projectNum)

      if (!project) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">Project not found: {args[1] || '(no number provided)'}</p>
            <p className="text-gray-500 mt-1">Available: 1-{projects.length}</p>
          </div>
        )
      }

      return (
        <div className="font-mono text-sm">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-terminal/10 border border-terminal/30 text-terminal hover:bg-terminal/20 transition"
            onClick={(e) => e.currentTarget.blur()}
          >
            <FaGithub size={14} />
            <span>{project.name}</span>
            <ExternalLink size={12} className="text-terminal/60" />
          </a>
        </div>
      )
    }

    // Handle invalid args
    if (args.length > 0) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">Invalid argument: {args.join(' ')}</p>
          <p className="text-gray-500 mt-1">
            Type <span className="text-terminal">help projects</span> for usage
          </p>
        </div>
      )
    }

    // Default: show all projects
    return (
      <div className="font-mono text-sm">
        <p className="text-gray-500 text-xs mb-3">Click a project or type <span className="text-terminal">projects -d [n]</span> for details</p>
        <div className="grid gap-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(e) => {
                const cmd = `projects --detail ${project.id}`
                context?.setText(cmd)
                context?.setCursorPos(cmd.length)
                e.currentTarget.blur()
              }}
            />
          ))}
        </div>
      </div>
    )
  }
}
