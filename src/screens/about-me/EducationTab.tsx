import React from 'react'
import { GraduationCap } from 'lucide-react'
import { formatPeriod, visible } from '@/services/profile'
import type { Education, Profile } from '@/types/profile'
import { GlowCard, CurrentBadge, TimelineIcon, LinkButton } from './shared'

function EducationCard({ edu }: { edu: Education }) {
  const current = edu.end === null
  return (
    <GlowCard
      highlight={current}
      className={`relative p-6 rounded-xl border ${
        current ? 'bg-neutral-900/95 border-terminal/30' : 'bg-neutral-900/50 border-neutral-800'
      }`}
    >
      <div className="flex items-start gap-4">
        <TimelineIcon icon={GraduationCap} current={current} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-lg font-medium text-white">{edu.school.en}</h3>
            {current && <CurrentBadge />}
          </div>
          <p className="font-mono text-sm text-terminal mt-0.5">{edu.degree.en}</p>
          <p className="font-mono text-xs text-gray-500 mt-1">{formatPeriod(edu.start, edu.end)}</p>
          {edu.description?.en && (
            <p className="font-mono text-sm text-gray-400 mt-3 leading-relaxed">{edu.description.en}</p>
          )}
        </div>
      </div>
      {edu.link && <LinkButton href={edu.link} label="Learn more" />}
    </GlowCard>
  )
}

export function EducationTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {visible(profile.education).map((edu, index) => (
        <EducationCard key={index} edu={edu} />
      ))}
    </div>
  )
}
