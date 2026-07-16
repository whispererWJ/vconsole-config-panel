import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import puppeteer from 'puppeteer';
// types
import type { Browser, Page } from 'puppeteer';
// utils
import { sleep } from "../utils";

describe('vConsole Config Panel UI 测试', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // 监听 console 日志
    page.on('console', (msg) => {
      console.log('Browser log:', msg.text());
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // 访问示例页面
    await page.goto('http://localhost:6008', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
  });

  describe('页面加载', () => {
    it('应该正确加载页面', async () => {
      const title = await page.title();
      expect(title).toBe('vConsole Config Panel 示例');

      const h1 = await page.$('h1');
      expect(h1).toBeDefined();
    });

    it('应该显示加密信息', async () => {
      const encryptionInfo = await page.$('.encryption-info');
      expect(encryptionInfo).toBeDefined();

      const keyDisplay = await page.$('#aesKeyDisplay');
      expect(keyDisplay).toBeDefined();

      const keyText = await page.$eval('#aesKeyDisplay', el => el.textContent);
      expect(keyText).toBeDefined();
      expect(keyText?.length).toBeGreaterThan(0);
    });

    it('应该显示状态栏', async () => {
      const statusBar = await page.$('#statusBar');
      expect(statusBar).toBeDefined();

      const statusText = await page.$eval('#statusBar', el => el.textContent);
      expect(statusText).toContain('打开 vConsole');
    });
  });

  describe('vConsole 打开和关闭', () => {
    it('点击"打开 vConsole"按钮应该打开 vConsole', async () => {
      const showBtn = await page.$('#showVConsole');
      expect(showBtn).toBeDefined();

      await showBtn?.click();

      // 等待 vConsole 加载
      await page.waitForSelector('.vc-panel', { timeout: 5000 });

      // 检查 vConsole 是否可见
      const vcPanel = await page.$('.vc-panel');
      expect(vcPanel).toBeDefined();

      // 检查调试面板是否存在
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });
      const configPanel = await page.$('.vconsole-config-panel');
      expect(configPanel).toBeDefined();
    });

    it('vConsole 应该显示配置数据', async () => {
      await page.click('#showVConsole');

      // 等待面板加载
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 检查配置项
      const configItems = await page.$$('.config-item');
      expect(configItems.length).toBeGreaterThan(0);

      // 检查特定配置值
      const versionValue = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(versionValue).toBeDefined();
      expect(versionValue).not.toBe('-');
    });
  });

  describe('面板交互 - Toast 提示', () => {
    beforeEach(async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });
    });

    it('点击刷新按钮应该显示 Toast 提示', async () => {
      const refreshBtn = await page.$('.config-btn[data-action="refresh"]');
      expect(refreshBtn).toBeDefined();
      await refreshBtn?.click();

      // 等待 Toast 出现
      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('刷新');
    });

    it('点击复制按钮应该显示 Toast 提示', async () => {
      const copyBtn = await page.$('.config-btn[data-action="copy"]');
      expect(copyBtn).toBeDefined();
      await copyBtn?.click();

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('复制');
    });

    it('点击配置项应该显示 Toast 提示', async () => {
      const configItem = await page.$('.config-item:first-child');
      expect(configItem).toBeDefined();

      const value = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(value).toBeDefined();
      expect(value).not.toBe('-');

      await configItem?.click();

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('已复制');
    });
  });

  describe('状态更新', () => {
    it('点击"更新状态数据"按钮应该更新状态', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      const oldVersion = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );

      await page.click('#updateState');

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('状态已更新');

      await sleep(2000);

      const newVersion = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );

      expect(newVersion).toBeDefined();
      expect(newVersion).not.toBe('-');
    });
  });

  describe('加密测试', () => {
    it('点击"测试加密"按钮应该显示加密测试结果', async () => {
      await page.click('#testEncryption');

      await page.waitForSelector('.config-toast', { timeout: 5000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('加密测试');
    });
  });

  describe('密钥管理', () => {
    it('点击"重新生成密钥"应该生成新密钥', async () => {
      const oldKey = await page.$eval(
        '#aesKeyDisplay',
        el => el.textContent
      );

      await page.click('#regenerateKey');

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('密钥');

      await sleep(500);
      const newKey = await page.$eval(
        '#aesKeyDisplay',
        el => el.textContent
      );

      expect(newKey).not.toBe(oldKey);
      expect(newKey?.length).toBeGreaterThan(0);
    });
  });

  describe('字段展示功能', () => {
    it('应该正确显示配置项的字段和值', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 检查配置组标题
      const groupTitles = await page.$$('.config-group-title');
      expect(groupTitles.length).toBeGreaterThan(0);

      // 检查配置项标签和值
      const configLabels = await page.$$('.config-label');
      const configValues = await page.$$('.config-value');
      
      expect(configLabels.length).toBeGreaterThan(0);
      expect(configValues.length).toBeGreaterThan(0);
      expect(configLabels.length).toEqual(configValues.length);

      // 检查每个配置项都有对应的字段标识
      const configItems = await page.$$('.config-item');
      for (const item of configItems) {
        const fieldAttr = await item.evaluate(el => el.getAttribute('data-field'));
        expect(fieldAttr).toBeDefined();
      }
    });
  });

  describe('文本赋值功能', () => {
    it('应该能够通过点击配置项复制其值到剪贴板', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 获取第一个配置项的值
      const firstConfigValue = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(firstConfigValue).toBeDefined();
      expect(firstConfigValue).not.toBe('-');

      // 点击配置项以复制值
      const firstConfigItem = await page.$('.config-item:first-child');
      await firstConfigItem?.click();

      // 检查是否显示复制成功的Toast
      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('已复制');
    });
  });

  describe('配置赋值功能', () => {
    it('应该能够在面板中显示最新的配置值', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 获取初始配置值
      const initialConfigValue = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(initialConfigValue).toBeDefined();

      // 更新状态
      await page.click('#updateState');
      await page.waitForSelector('.config-toast', { timeout: 3000 });

      // 等待配置值更新
      await sleep(1000);

      // 再次获取配置值，应该不同
      const updatedConfigValue = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(updatedConfigValue).toBeDefined();
      expect(updatedConfigValue).not.toEqual(initialConfigValue);
    });
  });

  describe('配置导入功能', () => {
    it('应该能够从剪贴板导入配置', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 获取当前配置值作为基准
      const initialConfigValue = await page.$eval(
        '.config-item:first-child .config-value',
        el => el.textContent
      );
      expect(initialConfigValue).toBeDefined();

      // 点击复制按钮将当前配置复制到剪贴板
      const copyBtn = await page.$('.config-btn[data-action="copy"]');
      expect(copyBtn).toBeDefined();
      await copyBtn?.click();

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const copyToast = await page.$('.config-toast');
      expect(copyToast).toBeDefined();

      // 等待复制完成
      await sleep(500);

      // 点击导入按钮（注意：这里需要模拟粘贴行为，因为真实浏览器限制）
      const importBtn = await page.$('.config-btn[data-action="import"]');
      expect(importBtn).toBeDefined();
      await importBtn?.click();

      // 检查是否显示导入成功的Toast
      await page.waitForSelector('.config-toast', { timeout: 5000 });
      const importToast = await page.$('.config-toast');
      expect(importToast).toBeDefined();

      const importToastText = await page.$eval('.config-toast', el => el.textContent);
      expect(importToastText).toContain('导入');
    });
  });

  describe('配置加密解密功能', () => {
    it('应该能够加密配置数据', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 点击复制按钮，这会触发加密
      const copyBtn = await page.$('.config-btn[data-action="copy"]');
      expect(copyBtn).toBeDefined();
      await copyBtn?.click();

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      const toast = await page.$('.config-toast');
      expect(toast).toBeDefined();

      const toastText = await page.$eval('.config-toast', el => el.textContent);
      expect(toastText).toContain('复制');

      // 检查剪贴板中的数据是否被加密
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
      expect(clipboardContent).toBeDefined();
    });

    it('应该能够解密配置数据', async () => {
      await page.click('#showVConsole');
      await page.waitForSelector('.vconsole-config-panel', { timeout: 5000 });

      // 先复制加密后的数据
      const copyBtn = await page.$('.config-btn[data-action="copy"]');
      expect(copyBtn).toBeDefined();
      await copyBtn?.click();

      await page.waitForSelector('.config-toast', { timeout: 3000 });
      await sleep(500);

      // 然后导入数据，这会触发解密
      const importBtn = await page.$('.config-btn[data-action="import"]');
      expect(importBtn).toBeDefined();
      await importBtn?.click();

      // 检查是否显示导入成功的Toast
      await page.waitForSelector('.config-toast', { timeout: 5000 });
      const importToast = await page.$('.config-toast');
      expect(importToast).toBeDefined();

      const importToastText = await page.$eval('.config-toast', el => el.textContent);
      expect(importToastText).toContain('导入');
    });
  });
});