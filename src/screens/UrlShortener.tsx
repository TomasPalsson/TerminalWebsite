import React, { useState, useEffect } from 'react'
import Loader from '../components/Loader'
import { Link2, Sparkles, Copy, Check, ExternalLink, AlertCircle, CheckCircle, Loader2, Hash } from 'lucide-react'

export default function UrlShortener() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugError, setSlugError] = useState('')
  const [showCopied, setShowCopied] = useState(false)

  const phrases = [
    'Shortening URL...',
    'Creating magic link...',
    'Compressing URL...',
    'Making it tiny...',
    'Almost there...',
    'Processing...',
    'Generating short link...',
    'Optimizing...',
  ]

  // Check slug availability when customSlug changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!customSlug) {
        setSlugAvailable(null)
        setSlugError('')
        return
      }

      setIsChecking(true)
      setSlugError('')
      try {
        const slug = customSlug.trim()
        const response = await fetch(`https://t0mas.io/check/${encodeURIComponent(slug)}`)
        const data = await response.json()
        setSlugAvailable(data.available)
      } catch {
        setSlugError('Failed to check slug availability')
        setSlugAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkSlugAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [customSlug])

  const handleShorten = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const trimmedUrl = url.trim()
      const trimmedSlug = customSlug.trim()

      const response = await fetch('https://t0mas.io/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: trimmedUrl,
          id: trimmedSlug || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to shorten URL')
      }

      setShortenedUrl(`${data.shortUrl}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim() && !isGenerating && (customSlug === '' || slugAvailable !== false)) {
      e.preventDefault()
      handleShorten()
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const canSubmit = url.trim() && isValidUrl(url.trim()) && !isGenerating && (customSlug === '' || slugAvailable !== false)

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
            <Link2 size={16} className="text-terminal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">url shortener</span>
              <span className="font-mono text-xs text-gray-600">—</span>
              <span className="font-mono text-xs text-gray-500">t0mas.io</span>
            </div>
            <p className="font-mono text-[10px] text-gray-600 mt-0.5">
              Create short, memorable links
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
            api
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl px-4 mx-auto py-8">
        {/* Input Section */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />

          <div className="relative p-6 rounded-xl bg-neutral-900/95 border border-terminal/30 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
            {/* URL Input */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-2">
                <Link2 size={12} />
                URL to shorten
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-neutral-700 focus-within:border-terminal/50 transition">
                <span className="text-terminal font-mono">$</span>
                <input
                  type="url"
                  placeholder="https://example.com/very-long-url..."
                  autoFocus
                  className="flex-1 font-mono text-sm text-white placeholder-gray-500 bg-transparent outline-none"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {url && (
                  <div className="shrink-0">
                    {isValidUrl(url.trim()) ? (
                      <CheckCircle size={16} className="text-terminal" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Slug Input */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-2">
                <Hash size={12} />
                Custom slug (optional)
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/50 border border-neutral-700 focus-within:border-terminal/50 transition">
                <span className="text-gray-500 font-mono text-sm">t0mas.io/</span>
                <input
                  type="text"
                  placeholder="my-custom-link"
                  className="flex-1 font-mono text-sm text-white placeholder-gray-500 bg-transparent outline-none"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {customSlug && (
                  <div className="shrink-0">
                    {isChecking ? (
                      <Loader2 size={16} className="text-gray-400 animate-spin" />
                    ) : slugAvailable === true ? (
                      <CheckCircle size={16} className="text-terminal" />
                    ) : slugAvailable === false ? (
                      <AlertCircle size={16} className="text-red-400" />
                    ) : null}
                  </div>
                )}
              </div>
              {/* Slug Status */}
              {customSlug && !isChecking && slugAvailable !== null && (
                <p className={`mt-2 font-mono text-xs flex items-center gap-1.5 ${slugAvailable ? 'text-terminal' : 'text-red-400'}`}>
                  {slugAvailable ? (
                    <>
                      <CheckCircle size={12} />
                      Slug is available
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} />
                      Slug is already taken
                    </>
                  )}
                </p>
              )}
              {slugError && (
                <p className="mt-2 font-mono text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  {slugError}
                </p>
              )}
            </div>

            {/* Shorten Button */}
            <button
              onClick={handleShorten}
              disabled={!canSubmit}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm rounded-lg transition ${
                canSubmit
                  ? 'bg-terminal text-black hover:bg-terminal/90 active:scale-[0.99]'
                  : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="animate-pulse">Shortening...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Shorten URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30 flex items-center justify-center mb-4">
              <Link2 size={24} className="text-terminal animate-pulse" />
            </div>
            <Loader phrases={phrases} />
          </div>
        )}

        {/* Result */}
        {!isGenerating && shortenedUrl && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/10 via-transparent to-terminal/10 rounded-xl blur-sm opacity-50" />

              <div className="relative p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-terminal/10 border border-terminal/30">
                    <CheckCircle size={20} className="text-terminal" />
                  </div>
                  <div>
                    <h2 className="font-mono text-sm font-medium text-terminal">
                      Link created successfully
                    </h2>
                    <p className="font-mono text-xs text-gray-500">
                      Your shortened URL is ready to use
                    </p>
                  </div>
                </div>

                {/* Shortened URL Display */}
                <div className="flex items-center gap-2 p-4 rounded-lg bg-black/50 border border-neutral-700">
                  <Link2 size={16} className="text-terminal shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={shortenedUrl}
                    className="flex-1 font-mono text-sm text-white bg-transparent outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs rounded-lg border transition shrink-0 ${
                      showCopied
                        ? 'border-terminal/50 bg-terminal/10 text-terminal'
                        : 'border-neutral-700 text-gray-400 hover:text-terminal hover:border-terminal/50'
                    }`}
                  >
                    {showCopied ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <a
                    href={shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-terminal hover:bg-terminal/10 transition"
                  >
                    <ExternalLink size={12} />
                    Open link
                  </a>
                  <button
                    onClick={() => {
                      setShortenedUrl('')
                      setUrl('')
                      setCustomSlug('')
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-neutral-700 text-gray-400 hover:text-white hover:border-neutral-600 transition"
                  >
                    Shorten another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 animate-in fade-in duration-300">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-sm text-red-400">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="font-mono text-xs text-red-400/70 hover:text-red-400 mt-1 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && !shortenedUrl && !error && (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
              <Link2 size={28} className="text-gray-600" />
            </div>
            <p className="font-mono text-sm text-gray-500 max-w-xs">
              Enter a URL above to create a short, shareable link
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
