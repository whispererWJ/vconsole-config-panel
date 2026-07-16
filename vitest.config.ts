// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 匹配 tests 下所有 .test.ts 和 .spec.ts 文件
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/index.ts', 'src/browser.ts'],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
      }
    },
    
    testTimeout: 30000
  }
})