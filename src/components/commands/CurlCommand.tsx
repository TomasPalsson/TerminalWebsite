import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Globe, FileText, AlertCircle } from 'lucide-react'

export const CurlCommand: Command = {
  name: 'curl',
  description: 'Make HTTP requests',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">curl [options] &lt;url&gt;</p>
      <p className="text-terminal mb-2">Options:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">-I, --head</span> — Fetch headers only</p>
        <p><span className="text-white">-i, --include</span> — Include headers with body</p>
      </div>
    </div>
  ),
  args: [],
  run: async (args: string[], _ctx: KeyPressContextType) => {
    if (!args.length) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">No URL provided</p>
          <p className="text-gray-500 mt-1">
            Example: <span className="text-terminal">curl https://api.example.com</span>
          </p>
        </div>
      )
    }

    const incHeaders = args.some(a => ['-i', '--include'].includes(a))
    const headOnly = args.some(a => ['-I', '--head'].includes(a))

    const url = args.find(
      a => !['-i', '--include', '-I', '--head'].includes(a)
    )

    if (!url?.startsWith('http')) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">Invalid URL</p>
          <p className="text-gray-500 mt-1">URL must start with http:// or https://</p>
        </div>
      )
    }

    try {
      const res = await fetch(url, headOnly ? { method: 'HEAD' } : {})
      const headerLines = [...res.headers.entries()]
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')

      const statusColor = res.ok ? 'text-terminal' : 'text-orange-400'

      if (headOnly) {
        return (
          <div className="font-mono text-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-terminal" />
              <span className="text-gray-400">Headers from</span>
              <span className="text-white">{url}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColor} bg-neutral-900 border border-neutral-800`}>
                {res.status}
              </span>
            </div>
            <pre className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-gray-400 text-xs overflow-x-auto">
              {headerLines}
            </pre>
          </div>
        )
      }

      const body = await res.text()
      const truncated = body.length > 2000

      return (
        <div className="font-mono text-sm">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-terminal" />
            <span className="text-gray-400">Response from</span>
            <span className="text-white truncate max-w-[200px]">{url}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${statusColor} bg-neutral-900 border border-neutral-800`}>
              {res.status}
            </span>
          </div>
          <pre className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 text-gray-400 text-xs overflow-x-auto max-h-64 overflow-y-auto">
            {incHeaders ? headerLines + '\n\n' : ''}
            {truncated ? body.slice(0, 2000) + '\n...[truncated]' : body || '[no body]'}
          </pre>
        </div>
      )
    } catch {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Request failed — check the URL or network</span>
          </div>
        </div>
      )
    }
  },
}

export default CurlCommand
