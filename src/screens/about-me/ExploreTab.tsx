import React from 'react'
import { Terminal, MessageSquare, Link2, Lightbulb, ChevronRight } from 'lucide-react'

const ITEMS = [
  {
    name: '3D Terminal',
    description: 'Interactive 3D terminal experience',
    icon: Terminal,
    path: '/blob',
  },
  {
    name: 'Chat with AI Me',
    description: 'Have a conversation with my AI clone',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    name: 'URL Shortener',
    description: 'Create short, memorable links',
    icon: Link2,
    path: '/shorten',
  },
  {
    name: 'Idea Generator',
    description: 'Get AI-powered project ideas',
    icon: Lightbulb,
    path: '/idea-generator',
  },
]

export function ExploreTab({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ITEMS.map((item, index) => (
        <button key={index} onClick={() => navigate(item.path)} className="relative group text-left">
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
