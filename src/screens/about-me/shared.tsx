import React from 'react'
import { ExternalLink } from 'lucide-react'

/** Card wrapper with the shared "highlighted" gradient glow used across timeline tabs. */
export function GlowCard({
  highlight,
  className,
  children,
}: {
  highlight: boolean
  className: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {highlight && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />
      )}
      <div className={className}>{children}</div>
    </div>
  )
}

export function CurrentBadge() {
  return (
    <span className="px-2 py-0.5 font-mono text-[10px] rounded-full bg-terminal/20 text-terminal border border-terminal/30">
      Current
    </span>
  )
}

export function TimelineIcon({
  icon: Icon,
  current,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  current: boolean
}) {
  return (
    <div
      className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
        current ? 'bg-terminal/10 border border-terminal/30' : 'bg-neutral-800 border border-neutral-700'
      }`}
    >
      <Icon size={24} className={current ? 'text-terminal' : 'text-gray-500'} />
    </div>
  )
}

export function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-4 pt-4 border-t border-neutral-800">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
      >
        <ExternalLink size={12} />
        {label}
      </a>
    </div>
  )
}
