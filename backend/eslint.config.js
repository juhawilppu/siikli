import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
  ignores: ['package.json', 'prisma/migrations/migration_lock.toml'],
})
