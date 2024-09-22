// eslint.config.mjs
// https://github.com/eslint/eslint/issues/17400

import reactPlugin from 'eslint-plugin-react';

export default [
  {
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "semi": "error",
      "prefer-const": "error",
      "no-var": "error",
      "indent": ["error", 2],
      "no-unused-vars": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
    },
  },
  {
    ignores: [
      "**/node_modules/**", 
      "**/dist/**",
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