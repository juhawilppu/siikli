// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['dist', 'build', 'coverage', '**/node_modules/**'],
})
