import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectsTab } from './ProjectsTab'
import type { Profile, Project } from '@/types/profile'

function makeProject(overrides: Partial<Project>): Project {
  return {
    name: { en: 'Test Project' },
    stack: [],
    bullets: { en: [] },
    ...overrides,
  }
}

function makeProfile(projects: Project[]): Profile {
  return {
    name: 'Test User',
    birthday: '2000-01-01',
    role: { en: 'Engineer' },
    summary: { en: 'Summary' },
    contact: {
      location: { en: 'Somewhere' },
      phone: '',
      email: '',
      website: '',
      github: '',
      linkedin: '',
    },
    experience: [],
    projects,
    education: [],
    certifications: [],
    skills: [],
    references: { en: '' },
  }
}

describe('ProjectsTab', () => {
  it('renders a link icon anchor when project.link is set, alongside the GitHub anchor', () => {
    const profile = makeProfile([
      makeProject({
        name: { en: 'Næsta Skref' },
        github: 'https://github.com/example/naestaskref',
        link: 'https://ai.naestaskref.is',
      }),
    ])

    render(<ProjectsTab profile={profile} />)

    const linkAnchor = screen.getByRole('link', { name: /open næsta skref/i })
    expect(linkAnchor).toHaveAttribute('href', 'https://ai.naestaskref.is')
    expect(linkAnchor).toHaveAttribute('target', '_blank')
    expect(linkAnchor).toHaveAttribute('rel', 'noopener noreferrer')

    const allLinks = screen.getAllByRole('link')
    const githubAnchor = allLinks.find(
      (a) => a.getAttribute('href') === 'https://github.com/example/naestaskref',
    )
    expect(githubAnchor).toBeDefined()
  })

  it('renders no anchors when project has neither github nor link', () => {
    const profile = makeProfile([makeProject({ name: { en: 'No Links Project' } })])

    render(<ProjectsTab profile={profile} />)

    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
