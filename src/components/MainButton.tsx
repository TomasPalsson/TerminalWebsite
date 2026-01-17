import React from 'react'
import Link from 'next/link'

type MainButtonProps = {
  children: React.ReactNode
  link: string
  variant?: 'primary' | 'secondary'
}

export function MainButton({ children, link, variant = 'secondary' }: MainButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2.5 font-mono text-sm rounded-lg transition'

  const variantClasses = {
    primary: 'bg-terminal text-black hover:bg-terminal/90 active:scale-[0.98]',
    secondary: 'border border-terminal/30 text-gray-400 hover:text-terminal hover:border-terminal/50',
  }

  return (
    <Link href={link}>
      <button className={`${baseClasses} ${variantClasses[variant]}`}>
        {children}
      </button>
    </Link>
  )
}
