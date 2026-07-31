import { test, expect } from "@playwright/test";

const baseUrl = "http://localhost:3000";

test.describe("加密示例页面 - /encrypted", () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的准备工作
    await page.goto(`${baseUrl}/encrypted`);
    await page.waitForLoadState("networkidle");
  });

  test("应该渲染加密示例页面并展示加密配置面板", async ({ page }) => {
    // 验证页面标题
    const heading = page.locator("h1");
    await expect(heading).toHaveText("vConsole Config Panel 加密示例");

    // 验证预置内容
    const pre = page.locator("pre");
    await expect(pre).toContainText("my-super-secret");

    // 打开 vConsole 开关
    const vcSwitch = page.locator(".vc-switch");
    await expect(vcSwitch).toBeVisible();
    await vcSwitch.click();

    // 切换到加密配置标签
    const configPanelTab = page.locator(".vc-tab", { hasText: "加密配置" });
    await expect(configPanelTab).toBeVisible();
    await configPanelTab.click();

    // 验证配置面板
    const panel = page.locator(".vconsole-config-panel");
    await expect(panel).toBeVisible();

    const groupTitle = panel.locator(".config-group-title").first();
    await expect(groupTitle).toHaveText("加密配置区");

    const configValue = panel.locator(
      '.config-item[data-field="secret"] .config-value',
    );
    await expect(configValue).toHaveText("my-super-secret");
  });

  test("刷新 Token 按钮应该更新 secret 字段", async ({ page }) => {
    // 获取初始值
    const pre = page.locator("pre");
    await expect(pre).toContainText("my-super-secret");

    // 点击刷新按钮
    await page.locator('button:has-text("刷新 Token")').click();

    // 等待更新完成（使用 waitFor 替代 waitForTimeout）
    await page.waitForFunction(() => {
      const pre = document.querySelector("pre");
      return pre?.textContent?.includes("secret-") ?? false;
    });

    // 验证更新后的值
    const updatedText = await pre.textContent();
    expect(updatedText).not.toContain("my-super-secret");
    expect(updatedText).toMatch(/secret-\d+/);
  });

  test("加密配置面板的复制导入流程应该保持数据一致", async ({ page }) => {
    // 设置剪贴板权限
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    // 获取初始数据
    const pre = page.locator("pre");
    await expect(pre).toBeVisible();

    // 刷新 Token 获取新数据
    await page.locator('button:has-text("刷新 Token")').click();
    await page.waitForTimeout(300);
    const modifiedText = await pre.textContent();

    // 打开 vConsole
    const vcSwitch = page.locator(".vc-switch");
    await vcSwitch.click();

    // 切换到加密配置
    const configPanelTab = page.locator(".vc-tab", { hasText: "加密配置" });
    await expect(configPanelTab).toBeVisible();
    await configPanelTab.click();

    // 复制配置
    const panel = page.locator(".vconsole-config-panel");
    await expect(panel).toBeVisible();

    await panel.locator('button[data-action="copy"]').click();
    await page.waitForTimeout(500);

    // 验证复制内容
    const copiedText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(copiedText.length).toBeGreaterThan(0);
    expect(copiedText).toContain("encrypted");

    // 再次刷新 Token
    await page.locator('button:has-text("刷新 Token")').click();
    await page.waitForTimeout(300);

    // 导入配置
    await panel.locator('button[data-action="import"]').click();
    await page.waitForTimeout(500);

    // 验证数据恢复
    const restoredText = await pre.textContent();
    expect(restoredText).toBe(modifiedText);
  });
});
