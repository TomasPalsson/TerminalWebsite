import React from 'react'
import { Mail, Github, Linkedin, MapPin } from 'lucide-react'
import type { Profile } from '@/types/profile'

type ContactItem = {
  type: string
  value: string
  href: string | null
  icon: typeof Mail
}

function ContactRow({ item }: { item: ContactItem }) {
  const content = (
    <>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 group-hover:border-terminal/30 transition">
        <item.icon size={18} className="text-gray-400 group-hover:text-terminal transition" />
      </div>
      <div className="flex-1">
        <p className="font-mono text-xs text-gray-500">{item.type}</p>
        <p className="font-mono text-sm text-white group-hover:text-terminal transition">{item.value}</p>
      </div>
    </>
  )

  if (!item.href) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg bg-black/50 border border-neutral-700">
        {content}
      </div>
    )
  }

  return (
    <a
      href={item.href}
      target={item.href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-lg bg-black/50 border border-neutral-700 hover:border-terminal/30 transition group"
    >
      {content}
    </a>
  )
}

export function ContactTab({ profile }: { profile: Profile }) {
  const { contact } = profile
  const items: ContactItem[] = [
    { type: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: Mail },
    { type: 'GitHub', value: 'TomasPalsson', href: contact.github, icon: Github },
    { type: 'LinkedIn', value: profile.name, href: contact.linkedin, icon: Linkedin },
    { type: 'Location', value: contact.location.en, href: null, icon: MapPin },
  ]

  return (
    <div className="max-w-xl">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-terminal/20 via-terminal/5 to-terminal/20 rounded-xl blur-sm opacity-50" />
        <div className="relative p-6 rounded-xl bg-neutral-900/95 border border-terminal/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-terminal/10 border border-terminal/30">
              <Mail size={24} className="text-terminal" />
            </div>
            <div>
              <h3 className="font-mono text-lg font-medium text-white">Get in touch</h3>
              <p className="font-mono text-xs text-gray-500">I'd love to hear from you</p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <ContactRow key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
