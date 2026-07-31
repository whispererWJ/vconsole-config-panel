import { Page, expect } from '@playwright/test';

// 等待元素出现并可见
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  return element;
}

// 等待文本变化
export async function waitForTextChange(
  page: Page,
  selector: string,
  oldText: string,
  timeout = 5000
) {
  await page.waitForFunction(
    ({ selector, oldText }) => {
      const element = document.querySelector(selector);
      return element?.textContent !== oldText;
    },
    { selector, oldText },
    { timeout }
  );
}

// 获取页面性能数据
export async function getPerformanceMetrics(page: Page) {
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as any;
    return {
      domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
      loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
      totalTime: perfData?.loadEventEnd - perfData?.fetchStart,
    };
  });
  return metrics;
}

// 截图并保存
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = true
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `test-results/screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path, fullPage });
  return path;
}

// 等待网络空闲
export async function waitForNetworkIdle(page: Page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// 检查控制台错误
export function captureConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}