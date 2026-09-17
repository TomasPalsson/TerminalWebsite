import type { ComponentType } from 'react'
import { FaRust, FaAws, FaReact, FaPython } from 'react-icons/fa'
import { TbBrandThreejs } from 'react-icons/tb'
import { SiAssemblyscript, SiOpenai } from 'react-icons/si'
import { FaDartLang, FaFlutter } from 'react-icons/fa6'

// Maps a Project.stack entry to its display icon. Unknown names render with no icon.
export const TECH_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  React: FaReact,
  'Three.js': TbBrandThreejs,
  Python: FaPython,
  AWS: FaAws,
  Rust: FaRust,
  Assembly: SiAssemblyscript,
  Flutter: FaFlutter,
  Dart: FaDartLang,
  OpenAI: SiOpenai,
}
