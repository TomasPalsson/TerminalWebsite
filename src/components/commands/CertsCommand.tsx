import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Award, ExternalLink } from 'lucide-react'

export const CertsCommand: Command = {
  name: 'certs',
  description: 'View my certifications',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">certs</p>
      <p className="text-terminal mb-2">Description:</p>
      <p className="text-gray-400">Lists my professional certifications</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    return (
      <div className="font-mono text-sm">
        <div className="p-4 rounded-lg bg-terminal/5 border border-terminal/30">
          <div className="flex items-start gap-4">
            <img
              src="/claude-certified-architect-foundations.png"
              alt="Claude Certified Architect - Foundations badge"
              width={64}
              height={64}
              loading="lazy"
              className="w-16 h-16 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">Claude Certified Architect - Foundations</h3>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-terminal/20 text-terminal border border-terminal/30">
                  Verified
                </span>
              </div>
              <p className="text-terminal">Anthropic</p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Award size={12} />
                Issued Jul 2026
              </p>
              <a
                href="https://www.credly.com/badges/a39e61b9-6494-4f41-b0ec-91f5f7ef1de2/public_url"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
                onClick={(e) => {
                  e.currentTarget.blur()
                }}
              >
                <span>Verify on Credly</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  },
}
