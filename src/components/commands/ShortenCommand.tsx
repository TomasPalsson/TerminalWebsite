import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'

const usage = (
  <div className="whitespace-pre-wrap">
    <p>
      <span className="text-terminal">shorten</span> — create or check short links<br />
      <span className="text-gray-400">Usage:</span><br />
      • <span className="text-terminal">shorten get &lt;name&gt;</span> — check availability; if taken, returns its URL<br />
      • <span className="text-terminal">shorten create &lt;name&gt; &lt;url&gt;</span> — create/overwrite a short link and return the short URL
    </p>
    <p className="text-gray-400">Examples:</p>
    <p className="text-terminal">  shorten get my-link</p>
    <p className="text-terminal">  shorten create my-link https://example.com</p>
  </div>
)

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
  description: 'Check or create short URLs',
  usage,
  args: [],
  run: async (args: string[], _ctx: KeyPressContextType) => {
    if (!args.length) {
      return (
        <p className="text-red-500">
          Missing subcommand. Try <span className="text-terminal">shorten get &lt;name&gt;</span> or{' '}
          <span className="text-terminal">shorten create &lt;name&gt; &lt;url&gt;</span>.
        </p>
      )
    }

    const [sub, ...rest] = args

    if (sub === 'get') {
      const name = rest[0]?.trim()
      if (!name) {
        return <p className="text-red-500">Usage: shorten get &lt;name&gt;</p>
      }
      try {
        const result = await checkName(name)
        if (result.available) {
          return <p className="text-terminal">✅ Available: {name}</p>
        }
        return (
          <p className="text-orange-400">
            Taken: <span className="text-white">{name}</span> →{' '}
            <span className="text-terminal">{result.url || 'unknown target'}</span>
          </p>
        )
      } catch (err) {
        return (
          <p className="text-red-500">
            {err instanceof Error ? err.message : 'Failed to check availability'}
          </p>
        )
      }
    }

    if (sub === 'create') {
      const name = rest[0]?.trim()
      const target = rest[1]?.trim()
      if (!name || !target) {
        return <p className="text-red-500">Usage: shorten create &lt;name&gt; &lt;url&gt;</p>
      }
      if (!/^https?:\/\//i.test(target)) {
        return <p className="text-red-500">URL must start with http:// or https://</p>
      }
      try {
        const result = await createShort(name, target)
        return (
          <p className="text-terminal">
            ✅ Created: <span className="text-white">{result.shortUrl || `https://t0mas.io/${name}`}</span>
          </p>
        )
      } catch (err) {
        return (
          <p className="text-red-500">
            {err instanceof Error ? err.message : 'Failed to create short URL'}
          </p>
        )
      }
    }

    return (
      <p className="text-red-500">
        Unknown subcommand: <span className="text-white">{sub}</span>. Try{' '}
        <span className="text-terminal">shorten get &lt;name&gt;</span> or{' '}
        <span className="text-terminal">shorten create &lt;name&gt; &lt;url&gt;</span>.
      </p>
    )
  },
}

export default ShortenCommand
