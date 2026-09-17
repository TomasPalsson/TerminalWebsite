/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'terminal-portfolio',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    }
  },
  async run() {
    const site = new sst.aws.StaticSite('TerminalPortfolio', {
      build: {
        command: 'npm run build',
        output: 'out',
      },
      domain:
        $app.stage === 'production'
          ? {
              name: 'tomasari.is',
              aliases: ['tomas.im', 'tomasp.me'],
              dns: false as const,
              cert: 'arn:aws:acm:us-east-1:519689943567:certificate/f4fd03e8-4134-49a4-8f6d-cf01ea78e060',
            }
          : $app.stage === 'dev'
            ? {
                name: 'dev.tomas.im',
                dns: false as const,
                cert: 'arn:aws:acm:us-east-1:519689943567:certificate/66ce7e53-cee8-405e-8e6c-889adb36176f',
              }
            : undefined,
    })

    return {
      url: site.url,
    }
  },
})
