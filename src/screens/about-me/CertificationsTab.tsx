import React from 'react'
import { Award } from 'lucide-react'
import { formatMonth, visible } from '@/services/profile'
import type { Certification, Profile } from '@/types/profile'
import { GlowCard, LinkButton } from './shared'

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <GlowCard highlight className="relative p-6 rounded-xl border bg-neutral-900/95 border-terminal/30">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={cert.badge}
          alt={`${cert.name} badge`}
          width={128}
          height={128}
          loading="lazy"
          className="w-32 h-32 shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h3 className="font-mono text-lg font-medium text-white">{cert.name}</h3>
            <span className="px-2 py-0.5 font-mono text-[10px] rounded-full bg-terminal/20 text-terminal border border-terminal/30">
              Verified
            </span>
          </div>
          <p className="font-mono text-sm text-terminal mt-0.5">{cert.issuer}</p>
          <p className="flex items-center justify-center sm:justify-start gap-1 font-mono text-xs text-gray-500 mt-1">
            <Award size={12} />
            Issued {formatMonth(cert.issued)}
          </p>
          {cert.description?.en && (
            <p className="font-mono text-sm text-gray-400 mt-3 leading-relaxed">{cert.description.en}</p>
          )}
        </div>
      </div>
      <LinkButton href={cert.link} label="Verify on Credly" />
    </GlowCard>
  )
}

export function CertificationsTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {visible(profile.certifications).map((cert) => (
        <CertificationCard key={cert.link} cert={cert} />
      ))}
    </div>
  )
}
