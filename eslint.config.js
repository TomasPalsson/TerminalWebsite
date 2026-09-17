import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default [
  { ignores: ['dist', '.next', 'out', 'node_modules', 'showcase', '.sst'] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-unused-vars': 'off',
    },
  },
]
