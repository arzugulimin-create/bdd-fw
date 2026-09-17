/**
 * ESLint flat configuration (ESLint 9+).
 *
 * - TypeScript files are linted with typescript-eslint (recommended ruleset).
 * - JavaScript files (scripts/, config files) are linted with core rules.
 * - Reports, build output and artifacts are ignored.
 */
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'reports/**',
      'allure-results/**',
      'playwright-report/**',
      'test-results/**',
      'screenshots/**',
      'videos/**',
      'traces/**',
      'package-lock.json',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
