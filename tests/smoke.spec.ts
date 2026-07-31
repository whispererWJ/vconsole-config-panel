import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('应用导航冒烟测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置测试超时
    test.setTimeout(30000);
  });

  test('首页应该可以跳转到加密示例页', async ({ page }) => {
    // 访问首页
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    
    const heading = page.locator('h1');
    await expect(heading).toHaveText('vConsole Config Panel 基础示例');

    // 点击导航链接
    await page.locator('nav a[href="/encrypted"]').click();
    await page.waitForURL(`${baseUrl}/encrypted`);

    // 验证跳转成功
    await expect(page.locator('h1')).toHaveText('vConsole Config Panel 加密示例');
  });

  test('加密示例页应该可以返回首页', async ({ page }) => {
    // 访问加密示例页
    await page.goto(`${baseUrl}/encrypted`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toHaveText('vConsole Config Panel 加密示例');

    // 点击返回首页
    await page.locator('nav a[href="/"]').click();
    await page.waitForURL(`${baseUrl}/`);

    // 验证跳转成功
    await expect(page.locator('h1')).toHaveText('vConsole Config Panel 基础示例');
  });

  test('页面性能测试 - 首页加载时间', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
    
    console.log(`首页加载时间: ${loadTime}ms`);
  });
});