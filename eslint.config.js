// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['dist', 'build', 'coverage', '**/node_modules/**', '*/tsconfig.json', '**/package.json', 'backend/prisma/migrations/migration_lock.toml', 'frontend/src/components/ui/*'],
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})
