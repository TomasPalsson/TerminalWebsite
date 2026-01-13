import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { MainButton } from './components/MainButton'
import TypingAnimation from './components/TypingAnimation'
import {
  Terminal,
  Sparkles,
  BookOpen,
  Mail,
  Github,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Code2,
  Cpu,
  Cloud,
} from 'lucide-react'
import { FaGithub, FaReact, FaAws, FaRobot } from 'react-icons/fa'
import { SiRust, SiFlutter } from 'react-icons/si'

function App() {
  const tools = [
    { label: 'AWS', icon: <FaAws /> },
    { label: 'Python', icon: <Code2 size={16} /> },
    { label: 'Java', icon: <Code2 size={16} /> },
    { label: 'Rust', icon: <SiRust /> },
    { label: 'Flutter', icon: <SiFlutter /> },
    { label: 'Serverless', icon: <Cloud size={16} /> },
    { label: 'Terraform', icon: <Cpu size={16} /> },
    { label: 'LLMs', icon: <FaRobot /> },
  ]

  const projects = [
    {
      name: 'Canvas App',
      description: 'AI-powered LMS client',
      icon: <SiFlutter />,
      href: 'https://github.com/TomasPalsson/canvas_app',
    },
    {
      name: 'Language Compiler',
      description: 'Compiler written in Rust',
      icon: <SiRust />,
      href: 'https://github.com/TomasPalsson/Language-Compiler',
    },
    {
      name: 'Terminal Portfolio',
      description: 'This website',
      icon: <FaReact />,
      href: 'https://github.com/TomasPalsson/TerminalWebsite',
    },
  ]

  const marqueeRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const speed = 0.5
    const tickMs = 32
    const id = window.setInterval(() => {
      if (!marqueeRef.current || isPaused) return
      const half = marqueeRef.current.scrollWidth / 2
      if (half <= marqueeRef.current.clientWidth) return
      marqueeRef.current.scrollLeft += speed
      if (marqueeRef.current.scrollLeft >= half) {
        marqueeRef.current.scrollLeft -= half
      }
    }, tickMs)
    return () => window.clearInterval(id)
  }, [isPaused])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terminal/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-terminal/10 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          {/* Top decoration */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-terminal/50" />
            <span className="font-mono text-xs text-terminal/60 tracking-widest">WELCOME</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-terminal/50" />
          </div>

          {/* Name - invisible spacer on left balances cursor on right */}
          <div className="flex justify-center items-center mb-3">
            <span className="text-5xl sm:text-6xl lg:text-7xl opacity-0 select-none">___</span>
            <TypingAnimation
              text="Tómas Ari Pálsson"
              speed={50}
              className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold text-terminal tracking-tight"
            />
          </div>

          {/* Tagline */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="w-8 h-px bg-neutral-800" />
            <p className="font-mono text-gray-500 text-sm sm:text-base">
              <span className="text-terminal/60">//</span> Software Dev
            </p>
            <span className="w-8 h-px bg-neutral-800" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <MainButton link="/terminal" variant="primary">
              <Terminal size={18} />
              <span>Open Terminal</span>
            </MainButton>
            <MainButton link="/aboutme" variant="secondary">
              <BookOpen size={18} />
              <span>About Me</span>
            </MainButton>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://t0mas.io/github"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-terminal transition"
            >
              <Github size={20} />
            </a>
            <a
              href="mailto:tomas@p5.is"
              className="text-gray-600 hover:text-terminal transition"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#about"
          className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-500 hover:text-terminal transition group"
        >
          <span className="font-mono text-xs">Explore</span>
          <ChevronDown size={20} className="animate-bounce group-hover:text-terminal" />
        </a>
      </div>

      {/* About Section */}
      <div id="about" className="relative px-4 py-24 bg-neutral-950">
        {/* Section glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-terminal/30 to-transparent" />

        <div className="w-full max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-terminal/10 border border-terminal/30">
              <Sparkles size={20} className="text-terminal" />
            </div>
            <div>
              <h2 className="font-mono text-sm text-terminal">About Me</h2>
              <p className="font-mono text-xs text-gray-600">Building lean, reliable products</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-10">
            <p className="font-mono text-base text-gray-300 leading-relaxed max-w-2xl">
              I'm Tómas, a software developer who enjoys building efficient, reliable software.
              I specialize in serverless systems and large language models, with a focus on
              solutions that scale and hold up in real use.
            </p>
          </div>

          {/* Skills Marquee */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={14} className="text-gray-500" />
              <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">Skills & Tools</span>
            </div>
            <div
              ref={marqueeRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none py-1"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {[...tools, ...tools].map((tool, idx) => (
                <div
                  key={`${tool.label}-${idx}`}
                  className="flex items-center gap-2 px-3 py-2 font-mono text-xs rounded-lg bg-neutral-900 border border-neutral-800 text-gray-400 whitespace-nowrap hover:border-terminal/30 hover:text-terminal transition shrink-0"
                >
                  <span className="text-terminal">{tool.icon}</span>
                  <span>{tool.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />
              <div className="relative p-6 rounded-xl bg-neutral-900 border border-terminal/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-terminal/10 border border-terminal/30">
                    <Mail size={18} className="text-terminal" />
                  </div>
                  <h3 className="font-mono text-base font-medium text-white">Contact</h3>
                </div>
                <div className="space-y-3">
                  <a
                    href="mailto:tomas@p5.is"
                    className="flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-neutral-800 hover:border-terminal/30 transition group/link"
                  >
                    <Mail size={16} className="text-gray-500 group-hover/link:text-terminal transition" />
                    <span className="font-mono text-sm text-gray-300 group-hover/link:text-white transition">tomas@p5.is</span>
                    <ExternalLink size={12} className="ml-auto text-gray-600" />
                  </a>
                  <a
                    href="https://t0mas.io/github"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-neutral-800 hover:border-terminal/30 transition group/link"
                  >
                    <Github size={16} className="text-gray-500 group-hover/link:text-terminal transition" />
                    <span className="font-mono text-sm text-gray-300 group-hover/link:text-white transition">t0mas.io/github</span>
                    <ExternalLink size={12} className="ml-auto text-gray-600" />
                  </a>
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700">
                      <FaGithub size={18} className="text-gray-400" />
                    </div>
                    <h3 className="font-mono text-base font-medium text-white">Recent Projects</h3>
                  </div>
                  <a
                    href="/aboutme"
                    className="font-mono text-xs text-gray-500 hover:text-terminal transition flex items-center gap-1"
                  >
                    View all
                    <ArrowRight size={12} />
                  </a>
                </div>
                <div className="space-y-2">
                  {projects.map((project, idx) => (
                    <a
                      key={idx}
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-neutral-800 hover:border-terminal/30 transition group/link"
                    >
                      <span className="text-terminal">{project.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white group-hover/link:text-terminal transition truncate">
                          {project.name}
                        </p>
                        <p className="font-mono text-xs text-gray-500 truncate">{project.description}</p>
                      </div>
                      <FaGithub size={14} className="text-gray-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 pt-10 border-t border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-sm text-gray-500">
                Want to learn more about my work?
              </p>
              <a
                href="/aboutme"
                className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-sm rounded-lg bg-terminal text-black hover:bg-terminal/90 transition"
              >
                <BookOpen size={16} />
                View Full Profile
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-8 bg-black border-t border-neutral-900">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://t0mas.io/github"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-terminal transition"
            >
              <Github size={18} />
            </a>
            <a
              href="mailto:tomas@p5.is"
              className="text-gray-600 hover:text-terminal transition"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
