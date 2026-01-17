import React from 'react'
import { Command } from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { FileText, ExternalLink } from 'lucide-react'

export const CvCommand: Command = {
  name: 'cv',
  description: 'Get a link to my CV',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">cv</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400">Opens my CV in a new tab</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    return (
      <div className="font-mono text-sm">
        <a
          href="https://api.tomas.im/cv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-terminal/10 border border-terminal/30 text-terminal hover:bg-terminal/20 transition"
          onClick={(e) => {
            e.currentTarget.blur()
          }}
        >
          <FileText size={14} />
          <span>View my CV</span>
          <ExternalLink size={12} className="text-terminal/60" />
        </a>
      </div>
    )
  },
}
