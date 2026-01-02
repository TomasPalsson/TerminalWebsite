import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import TypingAnimation from './components/TypingAnimation'
import { MainButton } from './components/MainButton'
import {
  Terminal,
  Sparkles,
  BookOpen,
  Rocket,
  Mail,
  Github,
} from 'lucide-react'
import { FaInfo, FaGithub, FaReact, FaAws, FaPython, FaJava, FaRobot } from 'react-icons/fa'
import { FaDartLang, FaFlutter } from 'react-icons/fa6'
import {
  SiAwslambda,
  SiTerraform,
  SiPython,
  SiRust,
  SiDart,
  SiFlutter,
  SiAmazondynamodb,
  SiAwsamplify,
} from 'react-icons/si'
import { TbBrandThreejs } from 'react-icons/tb'

function App() {
  const tools = [
    { label: 'AWS', icon: <FaAws className="text-terminal" /> },
    { label: 'AWS Bedrock', icon: <SiAmazondynamodb className="text-terminal" /> },
    { label: 'AWS AgentCore', icon: <SiAwsamplify className="text-terminal" /> },
    { label: 'Python', icon: <SiPython className="text-terminal" /> },
    { label: 'Java', icon: <FaJava className="text-terminal" /> },
    { label: 'Rust', icon: <SiRust className="text-terminal" /> },
    { label: 'Dart', icon: <SiDart className="text-terminal" /> },
    { label: 'Flutter', icon: <SiFlutter className="text-terminal" /> },
    { label: 'Serverless', icon: <SiAwslambda className="text-terminal" /> },
    { label: 'Terraform', icon: <SiTerraform className="text-terminal" /> },
    { label: 'LLMs', icon: <FaRobot className="text-terminal" /> },
  ]
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [dragState, setDragState] = useState<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  })

  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const speed = 0.6 // px per tick
    const tickMs = 32
    const id = window.setInterval(() => {
      if (!marqueeRef.current || isPaused || dragState.active) return
      const half = marqueeRef.current.scrollWidth / 2
      if (half <= marqueeRef.current.clientWidth) return
      marqueeRef.current.scrollLeft += speed
      if (marqueeRef.current.scrollLeft >= half) {
        marqueeRef.current.scrollLeft -= half
      }
    }, tickMs)
    return () => window.clearInterval(id)
  }, [isPaused, dragState.active])

  return (
    <>
      <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
        <TypingAnimation
          text="Tómas Ari Pálsson"
          speed={50}
          className="px-2 font-mono text-4xl text-center sm:text-5xl md:text-5xl lg:text-6xl text-terminal"
        />
        <span className='pt-5 font-mono text-gray-500 text-bold'>
          // Software Dev
        </span>
        <div className="flex flex-wrap justify-center gap-4 px-4 pt-6">
          <MainButton link="/terminal" >
            <Terminal />
            <span>Terminal</span>
          </MainButton>
          <MainButton link="/aboutme">
            <FaInfo />
            <span>About Me!</span>
          </MainButton>

        </div>

        <a href="#about" className="absolute flex flex-col items-center gap-1 bottom-8 text-terminal hover:text-green-300 transition">
          <span className="text-sm font-mono">Scroll</span>
          <span className="animate-bounce">↓</span>
        </a>
      </div>

      <div id="about" className="flex items-center min-h-screen px-6 py-16 bg-neutral-950">
        <div className="w-full max-w-5xl mx-auto text-white space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-terminal/60" />
              <span className="text-sm font-mono text-terminal">About Me</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-bold tracking-tight text-terminal">Building lean, reliable products</h2>
              <a
                href="/aboutme"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono border rounded border-terminal text-terminal hover:bg-terminal hover:text-black transition"
              >
                <BookOpen size={16} />
                Learn more
              </a>
            </div>
            <p className="font-mono text-sm leading-relaxed text-gray-300 max-w-3xl">
              I’m Tómas, a software developer who enjoys building efficient, reliable software. I specialize in serverless systems and large language models, with a focus on solutions that scale and hold up in real use.
            </p>
            <div className="relative w-full mt-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wide text-gray-400 select-none">
                <Sparkles size={14} className="text-terminal" />
                Skills
              </div>
              <div
                ref={marqueeRef}
                className="relative flex flex-nowrap whitespace-nowrap gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  if (!dragState.active) setIsPaused(false)
                }}
                onPointerDown={(e) => {
                  const el = marqueeRef.current
                  if (!el) return
                  setIsPaused(true)
                  setDragState({ active: true, startX: e.clientX, scrollLeft: el.scrollLeft })
                }}
                onPointerMove={(e) => {
                  if (!dragState.active) return
                  const el = marqueeRef.current
                  if (!el) return
                  const delta = e.clientX - dragState.startX
                  el.scrollLeft = dragState.scrollLeft - delta
                }}
                onPointerUp={() => {
                  setDragState((prev) => ({ ...prev, active: false }))
                  setIsPaused(false)
                }}
                onPointerLeave={() => {
                  setDragState((prev) => ({ ...prev, active: false }))
                  setIsPaused(false)
                }}
              >
                {[...tools, ...tools].map((tool, idx) => (
                  <div
                    key={`${tool.label}-${idx}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-terminal border rounded-full border-terminal/40 bg-terminal/10 whitespace-nowrap"
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="p-5 transition border rounded-lg border-terminal/50 bg-terminal/5 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.08)]">
                <div className="flex items-center gap-2 mb-3 text-terminal">
                  <Mail size={18} />
                  <h3 className="text-lg font-semibold">Contact</h3>
                </div>
                <div className="space-y-2 font-mono text-sm text-gray-200">
                  <a className="flex items-center gap-2 text-terminal hover:underline" href="mailto:tomas@p5.is">
                    <Mail size={14} className="text-terminal" />
                    <span className="text-white">tomas@p5.is</span>
                  </a>
                  <a className="flex items-center gap-2 text-terminal hover:underline" href="https://t0mas.io/github" target="_blank" rel="noreferrer">
                    <Github size={14} className="text-terminal" />
                    <span className="text-white">t0mas.io/github</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 transition border rounded-lg border-terminal/50 bg-terminal/5 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.08)]">
              <div className="flex items-center gap-2 mb-3 text-terminal">
                <Rocket size={18} />
                <h3 className="text-lg font-semibold">Recent projects</h3>
              </div>
              <div className="space-y-3 font-mono text-sm text-gray-200">
                <a href="https://github.com/TomasPalsson/canvas_app" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 transition rounded hover:bg-terminal/10 hover:underline hover:text-terminal">
                  <FaFlutter className="text-terminal" />
                  <span className="text-white group-hover:text-terminal">Canvas App (AI-powered LMS client)</span>
                  <FaGithub className="ml-auto text-terminal" />
                </a>
                <a href="https://github.com/TomasPalsson/Language-Compiler" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 transition rounded hover:bg-terminal/10 hover:underline hover:text-terminal">
                  <SiRust className="text-terminal" />
                  <span className="text-white group-hover:text-terminal">Language Compiler in Rust</span>
                  <FaGithub className="ml-auto text-terminal" />
                </a>
                <a href="https://github.com/TomasPalsson/TerminalWebsite" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 transition rounded hover:bg-terminal/10 hover:underline hover:text-terminal">
                  <FaReact className="text-terminal" />
                  <span className="text-white group-hover:text-terminal">Personal Terminal Website</span>
                  <FaGithub className="ml-auto text-terminal" />
                </a>
                <a href="/aboutme#fun" className="flex items-center gap-3 p-2 transition rounded hover:bg-terminal/10 hover:underline hover:text-terminal">
                  <Sparkles size={14} className="text-terminal" />
                  <span className="text-white group-hover:text-terminal">Fun stuff</span>
                  <FaGithub className="ml-auto text-transparent" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

}

export default App
