import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default [
  {
    ignores: [
      'dist',
      '.next',
      'out',
      'node_modules',
      'showcase',
      '.claude',
      // SST-owned: sst-env.d.ts is generated, sst.config.ts needs its triple-slash reference
      '.sst',
      'sst-env.d.ts',
      'sst.config.ts',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-unused-vars': 'off',
    },
  },
]
