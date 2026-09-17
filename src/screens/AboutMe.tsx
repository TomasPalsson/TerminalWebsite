'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Sparkles, FileText, GraduationCap, FolderGit2, Briefcase, Award } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import type { Profile } from '@/types/profile'
import { ExperienceTab } from './about-me/ExperienceTab'
import { EducationTab } from './about-me/EducationTab'
import { ProjectsTab } from './about-me/ProjectsTab'
import { CertificationsTab } from './about-me/CertificationsTab'
import { ExploreTab } from './about-me/ExploreTab'
import { ContactTab } from './about-me/ContactTab'

const TABS = [
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'projects', name: 'Projects', icon: FolderGit2 },
  { id: 'certifications', name: 'Certifications', icon: Award },
  { id: 'explore', name: 'Explore', icon: Sparkles },
  { id: 'contact', name: 'Contact', icon: Mail },
]

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState('experience')
  const router = useRouter()
  const { profile, error, loading } = useProfile()

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <AboutMeHeader />
      <AboutMeTabs activeTab={activeTab} onSelect={setActiveTab} />
      <div className="flex-1 w-full max-w-5xl px-4 mx-auto mt-6 pb-8">
        <AboutMeContent
          activeTab={activeTab}
          profile={profile}
          loading={loading}
          error={error}
          navigate={(path: string) => router.push(path)}
        />
      </div>
    </div>
  )
}

function AboutMeHeader() {
  return (
    <div className="w-full max-w-5xl px-4 pt-6 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-mono text-sm text-terminal">
            <User size={14} />
            About Me
          </h1>
          <p className="font-mono text-xs text-gray-600 mt-0.5">
            Tomas Palsson — Software Engineer
          </p>
        </div>
        <a
          href="https://api.tomasari.is/cv"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs rounded-lg border border-terminal/30 text-gray-400 hover:text-terminal hover:border-terminal/50 transition"
        >
          <FileText size={12} />
          Download CV
        </a>
      </div>
    </div>
  )
}

function AboutMeTabs({ activeTab, onSelect }: { activeTab: string; onSelect: (id: string) => void }) {
  return (
    <div className="w-full max-w-5xl px-4 mx-auto mt-6">
      <div className="overflow-x-auto pb-1 -mb-1">
        <div className="flex gap-1 p-1 rounded-lg bg-neutral-900/80 border border-neutral-800 w-fit">
          {TABS.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs rounded-md transition shrink-0 whitespace-nowrap ${
                activeTab === id
                  ? 'bg-terminal/15 text-terminal'
                  : 'text-gray-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon size={14} />
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AboutMeContent({
  activeTab,
  profile,
  loading,
  error,
  navigate,
}: {
  activeTab: string
  profile: Profile | null
  loading: boolean
  error: Error | null
  navigate: (path: string) => void
}) {
  if (activeTab === 'explore') return <ExploreTab navigate={navigate} />
  if (loading) return <p className="font-mono text-sm text-gray-600">Loading…</p>
  if (error || !profile) {
    return (
      <div className="font-mono text-sm text-gray-400 space-y-2">
        <p>Couldn&apos;t load profile data.</p>
        <a
          href="https://api.tomasari.is/cv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-terminal hover:underline"
        >
          View my CV
        </a>
      </div>
    )
  }

  switch (activeTab) {
    case 'experience':
      return <ExperienceTab profile={profile} />
    case 'education':
      return <EducationTab profile={profile} />
    case 'projects':
      return <ProjectsTab profile={profile} />
    case 'certifications':
      return <CertificationsTab profile={profile} />
    case 'contact':
      return <ContactTab profile={profile} />
    default:
      return null
  }
}
