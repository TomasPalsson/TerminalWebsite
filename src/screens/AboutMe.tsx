import React, { useState } from 'react'
import {
  User,
  GraduationCap,
  FolderGit2,
  Mail,
  Sparkles,
  ExternalLink,
  MapPin,
  FileText,
  Terminal,
  MessageSquare,
  Link2,
  Lightbulb,
  ChevronRight,
  Github,
} from 'lucide-react'
import { FaGithub, FaRust, FaAws, FaReact, FaPython } from 'react-icons/fa'
import { TbBrandThreejs } from 'react-icons/tb'
import { SiAssemblyscript, SiOpenai } from 'react-icons/si'
import { FaDartLang, FaFlutter } from 'react-icons/fa6'
import { useNavigate } from 'react-router'

const TABS = [
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'projects', name: 'Projects', icon: FolderGit2 },
  { id: 'explore', name: 'Explore', icon: Sparkles },
  { id: 'contact', name: 'Contact', icon: Mail },
]

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState('education')
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full max-w-5xl px-4 pt-6 mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-mono text-sm text-terminal">
              <User size={14} />
              About Me
            </h1>
            <p className="font-mono text-xs text-gray-600 mt-0.5">
              Tomas Palsson — Software Engineer
            </p>
          </div>
          <a
            href="https://api.tomas.im/cv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-gray-400 hover:text-terminal hover:border-terminal/50 transition"
          >
            <FileText size={12} />
            Download CV
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-5xl px-4 mx-auto mt-6">
        <div className="flex gap-1 p-1 rounded-lg bg-neutral-900/80 border border-neutral-800 w-fit">
          {TABS.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs rounded-md transition ${
                activeTab === id
                  ? 'bg-terminal/10 text-terminal border border-terminal/30'
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={14} />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-5xl px-4 mx-auto mt-6 pb-8">
        {activeTab === 'education' && <EducationTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'explore' && <ExploreTab navigate={navigate} />}
        {activeTab === 'contact' && <ContactTab />}
      </div>
    </div>
  )
}

function EducationTab() {
  const education = [
    {
      school: 'Háskólinn í Reykjavík',
      degree: 'BSc in Software Engineering',
      period: '2023 - 2026',
      description: 'Studying software engineering with focus on modern development practices, algorithms, and system design.',
      link: 'https://www.ru.is/deildir/tolvunarfraedideild/hugbunadarverkfraedi-bsc',
      current: true,
    },
    {
      school: 'Menntaskólinn við Hamrahlíð',
      degree: 'International Baccalaureate',
      period: '2021 - 2023',
      description: 'Completed the IB Diploma Programme with focus on mathematics and sciences.',
      link: 'https://www.mh.is/is/ib-studies',
      current: false,
    },
  ]

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <div key={index} className="relative">
          {edu.current && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />
          )}
          <div className={`relative p-6 rounded-xl border ${
            edu.current
              ? 'bg-neutral-900/95 border-terminal/30'
              : 'bg-neutral-900/50 border-neutral-800'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                  edu.current
                    ? 'bg-terminal/10 border border-terminal/30'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}>
                  <GraduationCap size={24} className={edu.current ? 'text-terminal' : 'text-gray-500'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-lg font-medium text-white">{edu.school}</h3>
                    {edu.current && (
                      <span className="px-2 py-0.5 font-mono text-[10px] rounded-full bg-terminal/20 text-terminal border border-terminal/30">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-terminal mt-0.5">{edu.degree}</p>
                  <p className="font-mono text-xs text-gray-500 mt-1">{edu.period}</p>
                  <p className="font-mono text-sm text-gray-400 mt-3 leading-relaxed">{edu.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <a
                href={edu.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
              >
                <ExternalLink size={12} />
                Learn more
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsTab() {
  const projects = [
    {
      name: 'Canvas App',
      description: 'A Canvas LMS client application built with Flutter. Custom wrapper for university learning platform with AI-powered features including chat, smart flashcards, and task management.',
      tech: [
        { icon: FaFlutter, name: 'Flutter' },
        { icon: FaDartLang, name: 'Dart' },
        { icon: SiOpenai, name: 'OpenAI' },
      ],
      features: [
        'Calendar View',
        'Course interaction',
        'AI assignment planning',
        'Chat with course material',
        'AI-generated flashcards',
      ],
      github: 'https://github.com/TomasPalsson/canvas_app',
    },
    {
      name: 'Language Compiler',
      description: 'A compiler for a custom programming language written in Rust. Compiles a basic language into assembly binary code.',
      tech: [
        { icon: FaRust, name: 'Rust' },
        { icon: SiAssemblyscript, name: 'Assembly' },
      ],
      features: [
        'Function definitions and calls',
        'Variable declarations',
        'While loops and conditionals',
        'Arithmetic & comparisons',
        'Print to stdout',
      ],
      github: 'https://github.com/TomasPalsson/Language-Compiler',
    },
    {
      name: 'Terminal Portfolio',
      description: 'This very website! Features a 3D terminal, CV viewer, AI chat, URL shortener, and idea generator. Hosted on AWS with Lambda backend.',
      tech: [
        { icon: FaReact, name: 'React' },
        { icon: TbBrandThreejs, name: 'Three.js' },
        { icon: FaPython, name: 'Python' },
        { icon: FaAws, name: 'AWS' },
      ],
      features: [
        '3D terminal interface',
        'AI chat integration',
        'URL shortener',
        'Idea generator',
        'CV viewer',
      ],
      github: 'https://github.com/TomasPalsson/TerminalWebsite',
    },
  ]

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div key={index} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
          <div className="relative p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-mono text-xl font-medium text-white">{project.name}</h3>
                <p className="font-mono text-sm text-gray-400 mt-2 leading-relaxed">{project.description}</p>
              </div>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/50 transition shrink-0"
              >
                <FaGithub size={20} />
              </a>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map(({ icon: Icon, name }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700"
                >
                  <Icon className="text-terminal" />
                  <span className="font-mono text-xs text-gray-400">{name}</span>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {project.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronRight size={12} className="text-terminal shrink-0" />
                  <span className="font-mono text-xs text-gray-500">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExploreTab({ navigate }: { navigate: (path: string) => void }) {
  const items = [
    {
      name: '3D Terminal',
      description: 'Interactive 3D terminal experience',
      icon: Terminal,
      path: '/blob',
      color: 'terminal',
    },
    {
      name: 'Chat with AI Me',
      description: 'Have a conversation with my AI clone',
      icon: MessageSquare,
      path: '/chat',
      color: 'terminal',
    },
    {
      name: 'URL Shortener',
      description: 'Create short, memorable links',
      icon: Link2,
      path: '/shorten',
      color: 'terminal',
    },
    {
      name: 'Idea Generator',
      description: 'Get AI-powered project ideas',
      icon: Lightbulb,
      path: '/idea-generator',
      color: 'terminal',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => navigate(item.path)}
          className="relative group text-left"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
          <div className="relative p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-terminal/30 transition h-full">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30 shrink-0 group-hover:scale-105 transition-transform">
                <item.icon size={24} className="text-terminal" />
              </div>
              <div className="flex-1">
                <h3 className="font-mono text-base font-medium text-white group-hover:text-terminal transition">
                  {item.name}
                </h3>
                <p className="font-mono text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-terminal group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function ContactTab() {
  const contacts = [
    {
      type: 'Email',
      value: 'tomas@p5.is',
      href: 'mailto:tomas@p5.is',
      icon: Mail,
    },
    {
      type: 'GitHub',
      value: 'TomasPalsson',
      href: 'https://t0mas.io/github',
      icon: Github,
    },
    {
      type: 'Location',
      value: 'Reykjavík, Iceland',
      href: null,
      icon: MapPin,
    },
  ]

  return (
    <div className="max-w-xl">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />
        <div className="relative p-6 rounded-xl bg-neutral-900/95 border border-terminal/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30">
              <Mail size={24} className="text-terminal" />
            </div>
            <div>
              <h3 className="font-mono text-lg font-medium text-white">Get in touch</h3>
              <p className="font-mono text-xs text-gray-500">I'd love to hear from you</p>
            </div>
          </div>

          <div className="space-y-3">
            {contacts.map((contact, index) => {
              const content = (
                <>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 group-hover:border-terminal/30 transition">
                    <contact.icon size={18} className="text-gray-400 group-hover:text-terminal transition" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-xs text-gray-500">{contact.type}</p>
                    <p className="font-mono text-sm text-white group-hover:text-terminal transition">
                      {contact.value}
                    </p>
                  </div>
                </>
              )

              return contact.href ? (
                <a
                  key={index}
                  href={contact.href}
                  target={contact.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg bg-black/50 border border-neutral-700 hover:border-terminal/30 transition group"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-black/50 border border-neutral-700"
                >
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
