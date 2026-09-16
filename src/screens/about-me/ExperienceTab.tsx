import React from 'react'
import { Briefcase, Calendar, MapPin } from 'lucide-react'
import { formatPeriod, visible } from '@/services/profile'
import type { Experience, Profile } from '@/types/profile'
import { hostname } from './utils'
import { GlowCard, CurrentBadge, TimelineIcon, LinkButton } from './shared'

function ExperienceMeta({ exp }: { exp: Experience }) {
  return (
    <div className="flex items-center gap-4 mt-1">
      <p className="flex items-center gap-1 font-mono text-xs text-gray-500">
        <Calendar size={12} />
        {formatPeriod(exp.start, exp.end)}
      </p>
      <p className="flex items-center gap-1 font-mono text-xs text-gray-500">
        <MapPin size={12} />
        {exp.location.en}
      </p>
    </div>
  )
}

function ExperienceBullets({ bullets }: { bullets: string[] }) {
  return (
    <div className="mt-3 space-y-1.5">
      {bullets.map((bullet, i) => (
        <p key={i} className="flex items-start gap-2 font-mono text-sm text-gray-400 leading-relaxed">
          <span className="text-terminal shrink-0">›</span>
          <span>{bullet}</span>
        </p>
      ))}
    </div>
  )
}

function ExperienceCard({ exp }: { exp: Experience }) {
  const current = exp.end === null
  return (
    <GlowCard
      highlight={current}
      className={`relative p-6 rounded-xl border ${
        current ? 'bg-neutral-900/95 border-terminal/30' : 'bg-neutral-900/50 border-neutral-800'
      }`}
    >
      <div className="flex items-start gap-4">
        <TimelineIcon icon={Briefcase} current={current} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-white">{exp.company}</h3>
            {current && <CurrentBadge />}
          </div>
          <p className="font-mono text-sm text-terminal mt-0.5">{exp.role.en}</p>
          <ExperienceMeta exp={exp} />
          {exp.product && (
            <span className="inline-block mt-2 px-2.5 py-1 font-mono text-xs rounded-md bg-terminal/10 text-terminal border border-terminal/30">
              {exp.product}
            </span>
          )}
          <ExperienceBullets bullets={exp.bullets.en} />
        </div>
      </div>
      {exp.link && <LinkButton href={exp.link} label={hostname(exp.link)} />}
    </GlowCard>
  )
}

export function ExperienceTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {visible(profile.experience).map((exp, index) => (
        <ExperienceCard key={index} exp={exp} />
      ))}
    </div>
  )
}
