import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Link, Check, X, AlertCircle, ExternalLink, Search } from 'lucide-react'

async function checkName(name: string) {
  const res = await fetch(`https://t0mas.io/check/${encodeURIComponent(name)}`)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || 'Check failed')
  }
  return data as { available: boolean; url?: string }
}

async function createShort(name: string, url: string) {
  const res = await fetch('https://t0mas.io/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, id: name }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || 'Create failed')
  }
  return data as { shortUrl: string }
}

export const ShortenCommand: Command = {
  name: 'shorten',
  description: 'Create or check short URLs',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">shorten [command] [args]</p>
      <p className="text-terminal mb-2">Commands:</p>
      <div className="space-y-1 text-gray-400">
        <p><span className="text-white">get &lt;name&gt;</span> — Check if a name is available</p>
        <p><span className="text-white">create &lt;name&gt; &lt;url&gt;</span> — Create a short link</p>
      </div>
      <p className="text-gray-500 text-xs mt-3">Links are created at t0mas.io/name</p>
    </div>
  ),
  args: [],
  run: async (args: string[], _ctx: KeyPressContextType) => {
    if (!args.length) {
      return (
        <div className="font-mono text-sm">
          <p className="text-red-400">Missing command</p>
          <p className="text-gray-500 mt-1">
            Try: <span className="text-terminal">shorten get mylink</span> or <span className="text-terminal">shorten create mylink https://example.com</span>
          </p>
        </div>
      )
    }

    const [sub, ...rest] = args

    if (sub === 'get') {
      const name = rest[0]?.trim()
      if (!name) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">No name provided</p>
            <p className="text-gray-500 mt-1">
              Example: <span className="text-terminal">shorten get mylink</span>
            </p>
          </div>
        )
      }

      try {
        const result = await checkName(name)

        if (result.available) {
          return (
            <div className="font-mono text-sm">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-terminal/10 border border-terminal/30">
                <Check size={14} className="text-terminal" />
                <span className="text-gray-400">Name</span>
                <span className="text-white font-medium">{name}</span>
                <span className="text-terminal">is available</span>
              </div>
            </div>
          )
        }

        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <X size={14} className="text-orange-400" />
              <span className="text-gray-400">Name</span>
              <span className="text-white font-medium">{name}</span>
              <span className="text-orange-400">is taken</span>
              {result.url && (
                <>
                  <span className="text-gray-600">→</span>
                  <span className="text-gray-400 truncate max-w-[200px]">{result.url}</span>
                </>
              )}
            </div>
          </div>
        )
      } catch (err) {
        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-red-400">{err instanceof Error ? err.message : 'Failed to check availability'}</span>
            </div>
          </div>
        )
      }
    }

    if (sub === 'create') {
      const name = rest[0]?.trim()
      const target = rest[1]?.trim()

      if (!name || !target) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">Missing arguments</p>
            <p className="text-gray-500 mt-1">
              Example: <span className="text-terminal">shorten create mylink https://example.com</span>
            </p>
          </div>
        )
      }

      if (!/^https?:\/\//i.test(target)) {
        return (
          <div className="font-mono text-sm">
            <p className="text-red-400">Invalid URL</p>
            <p className="text-gray-500 mt-1">URL must start with http:// or https://</p>
          </div>
        )
      }

      try {
        const result = await createShort(name, target)
        const shortUrl = result.shortUrl || `https://t0mas.io/${name}`

        return (
          <div className="font-mono text-sm">
            <div className="p-4 rounded-lg bg-terminal/10 border border-terminal/30">
              <div className="flex items-center gap-2 mb-3">
                <Check size={14} className="text-terminal" />
                <span className="text-terminal font-medium">Short link created!</span>
              </div>
              <div className="flex items-center gap-3">
                <Link size={14} className="text-gray-500" />
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white hover:text-terminal transition"
                >
                  {shortUrl}
                  <ExternalLink size={12} className="text-terminal/60" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-6">
                Redirects to: <span className="text-gray-400">{target}</span>
              </p>
            </div>
          </div>
        )
      } catch (err) {
        return (
          <div className="font-mono text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-red-400">{err instanceof Error ? err.message : 'Failed to create short URL'}</span>
            </div>
          </div>
        )
      }
    }

    return (
      <div className="font-mono text-sm">
        <p className="text-red-400">Unknown command: {sub}</p>
        <p className="text-gray-500 mt-1">
          Available: <span className="text-terminal">get</span>, <span className="text-terminal">create</span>
        </p>
      </div>
    )
  },
}

export default ShortenCommand
