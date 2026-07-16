// tests/ui/performance.test.ts
import puppeteer from "puppeteer";
// types
import type { Browser, Page } from "puppeteer";
// utils
import { sleep } from "../utils";

const URL = "http://localhost:6008";

describe("性能测试", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    await page.goto(URL, {
      waitUntil: "networkidle0",
    });
  });

  it("页面加载时间应该在 3 秒内", async () => {
    const startTime = Date.now();

    await page.goto(
      URL,
      {
        waitUntil: "networkidle0",
      },
    );

    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  it("vConsole 打开时间应该在 3 秒内", async () => {
    await page.click("#showVConsole");

    const startTime = Date.now();
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });
    const openTime = Date.now() - startTime;

    console.log(`vConsole 打开时间: ${openTime}ms`);
    expect(openTime).toBeLessThan(3000);
  });

  it("刷新操作应该在 1 秒内完成", async () => {
    await page.click("#showVConsole");
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });

    const startTime = Date.now();
    await page.click('.config-btn[data-action="refresh"]');

    // 等待 Toast 出现（表示操作完成）
    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const refreshTime = Date.now() - startTime;

    console.log(`刷新操作时间: ${refreshTime}ms`);
    expect(refreshTime).toBeLessThan(1000);
  });

  it("复制操作应该在 1 秒内完成", async () => {
    await page.click("#showVConsole");
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });

    const startTime = Date.now();
    await page.click('.config-btn[data-action="copy"]');

    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const copyTime = Date.now() - startTime;

    console.log(`复制操作时间: ${copyTime}ms`);
    expect(copyTime).toBeLessThan(1000);
  });

  it("配置项点击复制应该在 500ms 内完成", async () => {
    await page.click("#showVConsole");
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });

    const startTime = Date.now();
    await page.click(".config-item:first-child");

    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const clickTime = Date.now() - startTime;

    console.log(`配置项点击复制时间: ${clickTime}ms`);
    expect(clickTime).toBeLessThan(500);
  });

  it("状态更新应该在 1 秒内完成", async () => {
    await page.click("#showVConsole");
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });

    const startTime = Date.now();
    await page.click("#updateState");

    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const updateTime = Date.now() - startTime;

    console.log(`状态更新时间: ${updateTime}ms`);
    expect(updateTime).toBeLessThan(1000);
  });

  it("密钥重新生成应该在 1 秒内完成", async () => {
    const startTime = Date.now();
    await page.click("#regenerateKey");

    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const genTime = Date.now() - startTime;

    console.log(`密钥重新生成时间: ${genTime}ms`);
    expect(genTime).toBeLessThan(1000);
  });

  it("内存使用应该稳定（执行多次操作后）", async () => {
    // 获取初始内存使用
    const initialMetrics = await page.metrics();
    const initialMemory = initialMetrics.JSHeapUsedSize || 0;
    console.log(`初始内存: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);

    // 执行多次操作
    for (let i = 0; i < 5; i++) {
      await page.click("#showVConsole");
      await page.waitForSelector(".vconsole-config-panel", { timeout: 3000 });

      await page.click('.config-btn[data-action="refresh"]');
      await page.waitForSelector(".config-toast", { timeout: 2000 });
      await sleep(2000);

      // 关闭 vConsole
      await page.click(".vc-toggle");
      await sleep(500);
    }

    // 获取最终内存使用
    const finalMetrics = await page.metrics();
    const finalMemory = finalMetrics.JSHeapUsedSize || 0;
    console.log(`最终内存: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);

    // 内存增长应该小于 20MB
    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    console.log(`内存增长: ${memoryGrowthMB.toFixed(2)} MB`);
    expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
  });

  it("Toast 显示和消失时间应该符合预期", async () => {
    await page.click("#showVConsole");
    await page.waitForSelector(".vconsole-config-panel", { timeout: 5000 });

    // 触发 Toast
    await page.click('.config-btn[data-action="refresh"]');

    // 记录 Toast 出现时间
    const startTime = Date.now();
    await page.waitForSelector(".config-toast", { timeout: 3000 });
    const appearTime = Date.now() - startTime;
    console.log(`Toast 出现时间: ${appearTime}ms`);
    expect(appearTime).toBeLessThan(500);

    // 记录 Toast 消失时间（3秒后自动消失）
    await page.waitForSelector(".config-toast", {
      timeout: 3500,
      hidden: true,
    });
    const disappearTime = Date.now() - startTime;
    console.log(`Toast 消失时间: ${disappearTime}ms`);
    // Toast 应该在 3-4 秒内消失
    expect(disappearTime).toBeGreaterThan(2500);
    expect(disappearTime).toBeLessThan(4500);
  });
});
