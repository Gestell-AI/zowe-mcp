import js from '@eslint/js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'no-undef': 'off',
      'quotes': ['warn', 'single', { 'avoidEscape': true }],
      'semi': ['warn', 'never'],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
