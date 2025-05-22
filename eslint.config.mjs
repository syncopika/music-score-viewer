// eslint.config.mjs
// https://github.com/eslint/eslint/issues/17400

import js from '@eslint/js';

export default [
  {
    rules: {
      'semi': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
    },
  },
  {
    ignores: [
      '**/node_modules/**', 
      '**/dist/**',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
];