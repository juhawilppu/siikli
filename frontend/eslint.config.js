import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
  ignores: ['src/components/ui/**', 'package.json', 'tsconfig.json'],
})
