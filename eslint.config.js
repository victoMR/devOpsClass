import js from '@eslint/js'
import globals from 'globals'

export default {
  extends: [js.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  rules: {},
}