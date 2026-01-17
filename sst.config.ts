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
              name: 'tomas.im',
              dns: false as const,
              cert: 'arn:aws:acm:us-east-1:519689943567:certificate/09c69540-dffc-4cfa-8f70-bdc716268a33',
            }
          : $app.stage === 'dev'
            ? { name: 'dev.tomas.im', dns: false as const }
            : undefined,
    })

    return {
      url: site.url,
    }
  },
})
