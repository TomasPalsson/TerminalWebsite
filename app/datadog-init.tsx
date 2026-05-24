'use client'

import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'

const applicationId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN
const site = process.env.NEXT_PUBLIC_DD_SITE

// Skip init in environments that don't provide the RUM credentials (e.g. local
// dev without the production env file). The SDK otherwise logs an error every
// page load complaining about a missing applicationId.
if (typeof window !== 'undefined' && applicationId && clientToken && site) {
  datadogRum.init({
    applicationId,
    clientToken,
    site,
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
