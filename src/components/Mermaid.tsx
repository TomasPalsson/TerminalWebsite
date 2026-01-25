'use client'

import React, { useEffect, useState } from 'react'

interface MermaidProps {
  chart: string
}

// Clean mermaid input by removing invalid prefixes
function cleanMermaidCode(code: string): string {
  const lines = code.trim().split('\n')

  // Valid mermaid diagram types
  const validStarts = [
    'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
    'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitGraph',
    'mindmap', 'timeline', 'journey', 'quadrantChart', 'xychart',
    'sankey', 'requirement', 'c4Context', 'block'
  ]

  // Find the first line that starts with a valid diagram type
  const startIndex = lines.findIndex(line =>
    validStarts.some(type => line.trim().toLowerCase().startsWith(type.toLowerCase()))
  )

  if (startIndex > 0) {
    return lines.slice(startIndex).join('\n')
  }

  return code.trim()
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chart) return

    let cancelled = false
    const cleanedChart = cleanMermaidCode(chart)

    const renderChart = async () => {
      try {
        const mermaid = (await import('mermaid')).default

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#22c55e',
            primaryTextColor: '#fff',
            primaryBorderColor: '#22c55e',
            lineColor: '#22c55e',
            secondaryColor: '#18181b',
            tertiaryColor: '#27272a',
            background: '#0a0a0a',
            mainBkg: '#18181b',
            nodeBorder: '#22c55e',
            clusterBkg: '#18181b',
            clusterBorder: '#22c55e',
            titleColor: '#22c55e',
            edgeLabelBackground: '#18181b',
            nodeTextColor: '#fff',
          },
          fontFamily: 'JetBrains Mono, monospace',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
          securityLevel: 'loose',
        })

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg: renderedSvg } = await mermaid.render(id, cleanedChart)

        if (!cancelled) {
          setSvg(renderedSvg)
          setError(null)
        }
      } catch (err) {
        console.error('Mermaid error:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render')
          setSvg(null)
        }
      }
    }

    // Reset state before rendering
    setSvg(null)
    setError(null)

    const timeout = setTimeout(renderChart, 50)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [chart])

  // Show raw code on error as fallback
  if (error) {
    return (
      <div className="my-4 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border-b border-neutral-800">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="ml-2 font-mono text-xs text-gray-500">mermaid</span>
          <span className="ml-auto font-mono text-xs text-red-400">{error}</span>
        </div>
        <pre className="p-3 overflow-x-auto">
          <code className="font-mono text-sm text-gray-300">{chart}</code>
        </pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-4 p-4 rounded-lg bg-neutral-900 border border-terminal/20 overflow-x-auto">
        <span className="font-mono text-sm text-gray-500 animate-pulse">
          Rendering diagram...
        </span>
      </div>
    )
  }

  return (
    <div className="my-4 p-4 rounded-lg bg-neutral-900 border border-terminal/20 overflow-x-auto">
      <div
        className="flex justify-center [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
