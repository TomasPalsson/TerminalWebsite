import { FaRust, FaPython, FaJava, FaDocker, FaAws, FaGitAlt, FaReact, FaNodeJs } from 'react-icons/fa'
import { FaDartLang, FaGolang, FaFlutter } from 'react-icons/fa6'
import {
  SiTypescript, SiJavascript, SiCplusplus, SiNeovim, SiTerraform,
  SiFastapi, SiExpress, SiDjango, SiPhp, SiCss3, SiPostgresql,
  SiMongodb, SiFirebase, SiKotlin, SiSwift, SiOpenai, SiTailwindcss
} from 'react-icons/si'
import { TbSql, TbBrandThreejs } from 'react-icons/tb'
import { Code2 } from 'lucide-react'

type IconComponent = React.ComponentType<{ className?: string }>

// Unified icon mapping for skills and tech
export const techIconMap: Record<string, IconComponent> = {
  // Languages
  'rust': FaRust,
  'dart': FaDartLang,
  'python': FaPython,
  'typescript': SiTypescript,
  'javascript': SiJavascript,
  'c++': SiCplusplus,
  'cpp': SiCplusplus,
  'sql': TbSql,
  'go': FaGolang,
  'golang': FaGolang,
  'java': FaJava,
  'php': SiPhp,
  'css': SiCss3,
  'kotlin': SiKotlin,
  'swift': SiSwift,

  // Frameworks
  'flutter': FaFlutter,
  'fastapi': SiFastapi,
  'express': SiExpress,
  'django': SiDjango,
  'react': FaReact,
  'threejs': TbBrandThreejs,
  'three.js': TbBrandThreejs,

  // Tools
  'neovim': SiNeovim,
  'git': FaGitAlt,
  'aws': FaAws,
  'terraform': SiTerraform,
  'docker': FaDocker,
  'node': FaNodeJs,
  'nodejs': FaNodeJs,
  'node.js': FaNodeJs,

  // Databases
  'postgresql': SiPostgresql,
  'postgres': SiPostgresql,
  'mongodb': SiMongodb,
  'firebase': SiFirebase,

  // Other
  'openai': SiOpenai,
  'openai api': SiOpenai,
  'tailwind': SiTailwindcss,
  'tailwindcss': SiTailwindcss,
}

export function getTechIcon(tech: string): IconComponent {
  const normalized = tech.toLowerCase().split(' ')[0].replace(/[^a-z0-9+.]/g, '')
  return techIconMap[normalized] || Code2
}
