'use client'

import React from 'react'
import { Check } from 'lucide-react'
import type { Components } from 'react-markdown'

// Lazy load Mermaid to avoid SSR issues
const Mermaid = React.lazy(() => import('./Mermaid'))

/**
 * Custom markdown components for terminal styling with mermaid support.
 * Shared between IdeaGenerator and IdeaLibrary screens.
 */
export const markdownComponents: Components = {
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const codeString = String(children).replace(/\n$/, '')
    const isMultiLine = codeString.includes('\n')

    // Render mermaid diagrams
    if (language === 'mermaid') {
      return (
        <React.Suspense fallback={<div className="font-mono text-sm text-gray-500 animate-pulse">Loading diagram...</div>}>
          <Mermaid chart={codeString} />
        </React.Suspense>
      )
    }

    // Inline code (single line, no language)
    if (!className && !isMultiLine) {
      return (
        <code className="text-terminal bg-neutral-800 px-1.5 py-0.5 rounded" {...props}>
          {children}
        </code>
      )
    }

    // Code blocks (has language or is multi-line)
    return (
      <div className="my-3 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 border-b border-neutral-800">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          {language && (
            <span className="ml-2 font-mono text-xs text-gray-500">{language}</span>
          )}
        </div>
        <pre className="p-3 overflow-x-auto">
          <code className="font-mono text-sm text-gray-300" {...props}>
            {children}
          </code>
        </pre>
      </div>
    )
  },
  pre: ({ children }) => <>{children}</>,
  li: ({ children, ...props }) => {
    const childArray = React.Children.toArray(children)
    const firstChild = childArray[0]

    // Check if this is a checkbox item
    if (typeof firstChild === 'string') {
      const uncheckedMatch = firstChild.match(/^\s*\[\s*\]\s*(.*)/)
      const checkedMatch = firstChild.match(/^\s*\[x\]\s*(.*)/i)

      if (uncheckedMatch || checkedMatch) {
        const isChecked = !!checkedMatch
        const text = isChecked ? checkedMatch[1] : uncheckedMatch![1]
        const restChildren = childArray.slice(1)

        return (
          <li className="flex items-start gap-2 list-none" {...props}>
            <span
              className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                isChecked
                  ? 'bg-terminal border-terminal text-black'
                  : 'border-gray-600 bg-neutral-800'
              }`}
            >
              {isChecked && <Check size={12} strokeWidth={3} />}
            </span>
            <span className={isChecked ? 'text-gray-400 line-through' : ''}>
              {text}
              {restChildren}
            </span>
          </li>
        )
      }
    }

    return <li {...props}>{children}</li>
  },
  ul: ({ children, ...props }) => {
    // Check if this list contains checkbox items
    const hasCheckboxes = React.Children.toArray(children).some((child) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
        const firstChild = React.Children.toArray(child.props.children)[0]
        if (typeof firstChild === 'string') {
          return /^\s*\[[\sx]\]/i.test(firstChild)
        }
      }
      return false
    })

    return (
      <ul className={hasCheckboxes ? 'space-y-1 list-none pl-0' : ''} {...props}>
        {children}
      </ul>
    )
  },
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-neutral-800">
      <table className="w-full font-mono text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-neutral-800/50 border-b border-neutral-700" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-neutral-800" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="hover:bg-neutral-800/30 transition" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-2 text-left text-terminal font-medium" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2 text-gray-300" {...props}>
      {children}
    </td>
  ),
}
