import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import globals from 'globals'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

// Compatibility layer for Next.js config
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  // Ignore patterns - must be first
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '.lintstagedrc.js',
      'public/**',
      'next-env.d.ts',
      '.cache/**',
      'dist/**',
      'e2e/**'
    ]
  },
  
  // Next.js recommended configuration
  ...compat.extends('next/core-web-vitals'),
  
  // JavaScript recommended rules
  js.configs.recommended,
  
  // Main configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      // TypeScript rules - these add extra strictness beyond Next.js defaults
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      
      // React rules (overriding Next.js defaults where needed)
      'react/no-unescaped-entities': 'off',
      
      // General rules
      'no-console': 'off',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // Disable base rule as we use TypeScript's version
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any in tests but warn
      'no-console': 'off', // Allow console in tests
    },
  },
  // Example files configuration
  {
    files: ['**/*.example.{js,jsx,ts,tsx}', '**/examples/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off', // Allow console in examples
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in examples
      '@typescript-eslint/no-unused-vars': 'warn', // Warn instead of error
      'no-unused-vars': 'off',
    },
  },
]