import { test, expect, Page } from '@playwright/test';

declare global {
  interface Window {
    vConsole: any;
    VConsoleConfigPanel: any;
  }
}

// 测试用例：基础功能
test.describe('vConsole Config Panel UI Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // 访问示例页面
    await page.goto('/examples/ui-test-demo.html');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('应正确初始化配置面板并显示标题', async () => {
    // 等待vConsole加载
    await page.waitForFunction(() => window.vConsole !== undefined);
    
    // 等待面板加载
    await page.waitForSelector('#vconsole-panel-config');
    
    // 检查面板是否存在
    const panelVisible = await page.isVisible('#vconsole-panel-config');
    expect(panelVisible).toBe(true);
    
    // 检查面板标题
    const titleElement = page.locator('.vc-switch-tab[data-active="1"]');
    await expect(titleElement).toContainText('Config Panel');
  });

  test('应正确显示配置项和分组', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 检查配置项是否正确显示
    await expect(page.locator('.config-group')).toHaveCount(3); // Basic, Advanced, System groups
    
    // 检查特定配置项是否存在
    await expect(page.locator('.config-item[data-field="appName"]')).toContainText('App Name');
    await expect(page.locator('.config-item[data-field="version"]')).toContainText('Version');
    await expect(page.locator('.config-item[data-field="env"]')).toContainText('Environment');
    
    // 检查分组标题
    await expect(page.locator('.config-group-title')).toContainText(['Basic Info', 'Advanced Settings', 'System Info']);
  });

  test('应正确处理配置项的点击复制功能', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 点击第一个配置项以复制其值
    const firstConfigItem = page.locator('.config-item').first();
    const originalValue = await firstConfigItem.locator('.config-value').textContent();
    
    await firstConfigItem.click();
    
    // 检查是否显示了复制成功的提示
    await expect(page.locator('.config-toast')).toContainText('已复制');
    
    // 检查剪贴板内容
    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    expect(clipboardText).toBe(originalValue?.trim());
  });

  test('应正确执行刷新功能', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 获取刷新前的某个值
    const oldValue = await page.locator('.config-item[data-field="version"] .config-value').textContent();
    
    // 点击刷新按钮
    await page.click('[data-action="refresh"]');
    
    // 检查是否显示了刷新成功的提示
    await expect(page.locator('.config-toast')).toContainText('已刷新配置');
    
    // 获取刷新后的值并比较（这里我们模拟了一个会改变的值）
    const newValue = await page.locator('.config-item[data-field="timestamp"] .config-value').textContent();
    expect(newValue).not.toBe('');
  });

  test('应正确执行复制配置功能', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 点击复制配置按钮
    await page.click('[data-action="copy"]');
    
    // 检查是否显示了复制成功的提示
    await expect(page.locator('.config-toast')).toContainText('配置已复制到剪贴板');
    
    // 检查剪贴板内容是否为JSON格式
    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    expect(() => JSON.parse(clipboardText)).not.toThrow();
    
    // 检查复制的内容是否包含所有配置项
    const parsedData = JSON.parse(clipboardText);
    expect(parsedData).toHaveProperty('appName');
    expect(parsedData).toHaveProperty('version');
    expect(parsedData).toHaveProperty('env');
  });

  test('应正确处理getValue函数获取的值', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 检查通过getValue函数获取的配置项
    await expect(page.locator('.config-item[data-field="dynamicValue"] .config-value')).not.toHaveText('-');
    
    // 检查动态值是否是数字格式
    const dynamicValueText = await page.locator('.config-item[data-field="dynamicValue"] .config-value').textContent();
    expect(!isNaN(Number(dynamicValueText))).toBe(true);
  });

  test('应正确应用CSS样式和主题', async () => {
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('#vconsole-panel-config');
    
    // 点击配置面板标签
    await page.click('[data-tabid="config"]');
    
    // 检查面板是否具有正确的CSS类
    await expect(page.locator('.vconsole-config-panel')).toHaveClass(/vconsole-config-panel/);
    
    // 检查分组容器样式
    await expect(page.locator('.config-group')).toHaveCSS('border', /solid/);
    
    // 检查按钮样式
    await expect(page.locator('.config-btn')).toHaveCSS('padding', '10px 15px');
    
    // 检查标签样式
    await expect(page.locator('.config-label')).toHaveCSS('font-weight', 'bold');
    
    // 检查值显示区域样式
    await expect(page.locator('.config-value')).toHaveCSS('color', /rgb\(.*\)/);
  });

  test('应正确处理加密配置的复制功能', async () => {
    // 使用加密配置示例页面
    await page.goto('/examples/encrypted-config-demo.html');
    await page.waitForLoadState('networkidle');
    
    await page.waitForFunction(() => window.vConsole !== undefined);
    await page.waitForSelector('.vconsole-config-panel');
    
    // 点击加密配置面板标签
    await page.click('[data-tabid="config-encrypted"]');
    
    // 点击复制配置按钮
    await page.click('[data-action="copy"]');
    
    // 检查是否显示了复制成功的提示
    await expect(page.locator('.config-toast')).toContainText('配置已复制到剪贴板');
    
    // 检查剪贴板内容是否为加密格式
    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    const parsedData = JSON.parse(clipboardText);
    
    expect(parsedData).toHaveProperty('encrypted');
    expect(parsedData.encrypted).toBe(true);
    expect(parsedData).toHaveProperty('data');
  });
});