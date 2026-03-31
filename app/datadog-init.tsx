'use client'

import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'

if (typeof window !== 'undefined') {
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
    site: process.env.NEXT_PUBLIC_DD_SITE!,
    service: 'terminal-portfolio',
    env: 'production',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin()],
  })
}

export function DatadogInit() {
  return null
}
