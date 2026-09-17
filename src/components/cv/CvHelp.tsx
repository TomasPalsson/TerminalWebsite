'use client'

const KEYS: [string, string][] = [
  ['j / k', 'scroll down / up'],
  ['n / p', 'next / previous page'],
  ['gg / G', 'first / last page'],
  ['+ / -', 'zoom in / out'],
  ['0', 'reset zoom'],
  ['t', 'toggle phosphor (CRT) mode'],
  ['c', 'cat mode — plain text dump'],
  ['x', 'xxd mode — hex dump'],
  ['v', 'back to the pdf'],
  ['d', 'download cv.pdf'],
  [':', 'command line (:2, :zoom 150, :crt, :w, :q)'],
  ['?', 'toggle this help'],
  ['Esc', 'close overlay / command line'],
]

type Props = { onClose: () => void }

export default function CvHelp({ onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-terminal/50 rounded-lg p-4 bg-neutral-950 font-mono text-sm"
      >
        <p className="text-terminal mb-3">less(1) — but for a CV</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {KEYS.map(([key, desc]) => (
            <div key={key} className="contents">
              <dt className="text-terminal whitespace-nowrap">{key}</dt>
              <dd className="text-gray-300">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-gray-500">press ? or Esc to close</p>
      </div>
    </div>
  )
}
