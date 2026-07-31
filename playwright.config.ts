import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试文件目录
  testDir: './tests',
  
  // 是否完全并行运行测试
  fullyParallel: true,
  
  // CI 环境配置
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // 全局使用配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',
    
    // 截图配置
    screenshot: 'only-on-failure',
    
    // 录像配置
    video: 'retain-on-failure',
    
    // 追踪配置
    trace: 'on-first-retry',
    
    // 动作超时
    actionTimeout: 10000,
    
    // 导航超时
    navigationTimeout: 30000,
  },

  // 项目配置（不同浏览器）
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',  // 使用系统 Chrome
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    // 如果需要更多浏览器
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 开发服务器配置（可选）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});