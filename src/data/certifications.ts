export type Certification = {
  name: string
  issuer: string
  issued: string
  description: string
  badge: string
  link: string
}

export const certifications: Certification[] = [
  {
    name: 'Claude Certified Architect - Professional',
    issuer: 'Anthropic',
    issued: 'Issued Aug 2026',
    description:
      'The Claude Certified Architect – Professional credential is designed for experienced solution architects. Earners can design and lead enterprise-scale Claude deployments, architect integrations, optimize systems at scale, and apply governance and responsible deployment practices.',
    badge: '/claude-certified-architect-professional.png',
    link: 'https://www.credly.com/badges/82027f51-d636-4535-8f67-8bbe2aea36a2/public_url',
  },
  {
    name: 'Claude Certified Architect - Foundations',
    issuer: 'Anthropic',
    issued: 'Issued Jul 2026',
    description:
      'The Claude Certified Architect – Foundations credential is designed for solution architects. Earners can design and build production-grade applications with Claude using Claude Code, the Claude Agent SDK, the Claude API, and MCP.',
    badge: '/claude-certified-architect-foundations.png',
    link: 'https://www.credly.com/badges/a39e61b9-6494-4f41-b0ec-91f5f7ef1de2/public_url',
  },
]
