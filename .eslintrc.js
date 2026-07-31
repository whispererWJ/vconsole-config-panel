module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  overrides: [
    {
      files: ['__tests__/**/*.test.ts'],
      env: {
        'vitest/globals': true
      },
      plugins: ['vitest'],
      extends: ['plugin:vitest/recommended']
    }
  ]
};