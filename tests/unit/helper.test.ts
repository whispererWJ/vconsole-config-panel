// tests/unit/helper.test.ts
import { describe, it, expect } from 'vitest';
import {
  getItemValue,
  generateHtml,
  generateHtmlWithId,
  collectConfigData
} from '../../src/helper';

describe('helper 工具函数', () => {
  describe('getItemValue', () => {
    it('应该从 state 中通过 field 获取值', () => {
      const item = { label: '版本号', field: 'version' };
      const state = { version: '1.0.0' };
      expect(getItemValue(item, state)).toBe('1.0.0');
    });

    it('应该通过 getValue 函数获取值', () => {
      const item = {
        label: '构建时间',
        getValue: () => '2024-01-01'
      };
      expect(getItemValue(item, {})).toBe('2024-01-01');
    });

    it('当 field 和 getValue 都不存在时返回 "-"', () => {
      const item = { label: '未知' };
      expect(getItemValue(item, {})).toBe('-');
    });

    it('当 field 在 state 中不存在时返回 "-"', () => {
      const item = { label: '版本号', field: 'version' };
      expect(getItemValue(item, {})).toBe('-');
    });

    it('getValue 返回数字时应转换为字符串', () => {
      const item = {
        label: '数值',
        getValue: () => 123
      };
      expect(getItemValue(item, {})).toBe('123');
    });

    it('getValue 返回布尔值时应转换为字符串', () => {
      const item = {
        label: '布尔值',
        getValue: () => true
      };
      expect(getItemValue(item, {})).toBe('true');
    });

    it('getValue 返回 null 时应转为空字符串', () => {
      const item = {
        label: '空值',
        getValue: () => null
      };
      expect(getItemValue(item, {})).toBe('');
    });

    it('getValue 返回 undefined 时应转为空字符串', () => {
      const item = {
        label: '未定义',
        getValue: () => undefined
      };
      expect(getItemValue(item, {})).toBe('');
    });
  });

  describe('generateHtml', () => {
    it('应该生成包含配置项的 HTML 结构', () => {
      const items = [{
        title: '版本信息',
        children: [
          { label: '版本号', field: 'version' }
        ]
      }];
      const state = { version: '1.0.0' };
      const html = generateHtml(items, state);
      
      expect(html).toContain('版本信息');
      expect(html).toContain('版本号');
      expect(html).toContain('1.0.0');
      expect(html).toContain('config-btn');
      expect(html).toContain('data-action="refresh"');
      expect(html).toContain('data-action="copy"');
      expect(html).toContain('data-action="import"');
    });

    it('空配置时应该生成只有按钮的面板', () => {
      const items: any[] = [];
      const html = generateHtml(items, {});
      
      expect(html).toContain('vconsole-config-panel');
      expect(html).toContain('config-actions');
      expect(html).toContain('刷新');
      expect(html).toContain('复制配置');
      expect(html).toContain('导入配置');
    });

    it('多个配置组时应该生成多个组', () => {
      const items = [
        {
          title: '组1',
          children: [{ label: '项1', field: 'field1' }]
        },
        {
          title: '组2',
          children: [{ label: '项2', field: 'field2' }]
        }
      ];
      const state = { field1: '值1', field2: '值2' };
      const html = generateHtml(items, state);
      
      expect(html).toContain('组1');
      expect(html).toContain('组2');
      expect(html).toContain('项1');
      expect(html).toContain('项2');
      expect(html).toContain('值1');
      expect(html).toContain('值2');
    });

    it('应该生成带唯一 panelId 的 HTML', () => {
      const items: any[] = [];
      const result = generateHtmlWithId(items, {});
      
      expect(result.html).toContain('vconsole-config-panel');
      expect(result.panelId).toBeDefined();
      expect(result.panelId).toContain('vconsole_panel_');
      expect(result.html).toContain(`id="${result.panelId}"`);
      expect(result.html).toContain(`data-panel-id="${result.panelId}"`);
    });

    it('多次调用 generateHtmlWithId 应生成不同的 panelId', () => {
      const result1 = generateHtmlWithId([], {});
      const result2 = generateHtmlWithId([], {});
      
      expect(result1.panelId).not.toBe(result2.panelId);
    });

    it('应该正确处理 HTML 转义防止 XSS', () => {
      const items = [{
        title: '<script>alert("xss")</script>',
        children: [
          { label: '<b>标签</b>', field: 'test' }
        ]
      }];
      const html = generateHtml(items, { test: '<img src=x onerror=alert(1)>' });
      
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img');
      expect(html).not.toContain('<b>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;标签&lt;/b&gt;');
      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('collectConfigData', () => {
    it('应该收集所有配置项的值', () => {
      const items = [{
        title: '版本信息',
        children: [
          { label: '版本号', field: 'version' },
          { label: '构建时间', field: 'buildTime' }
        ]
      }];
      const state = {
        version: '1.0.0',
        buildTime: '2024-01-01'
      };
      
      const data = collectConfigData(items, state);
      expect(data).toEqual({
        version: '1.0.0',
        buildTime: '2024-01-01'
      });
    });

    it('只收集有 field 的配置项', () => {
      const items = [{
        title: '信息',
        children: [
          { label: '版本号', field: 'version' },
          { label: '构建时间', getValue: () => '2024-01-01' }
        ]
      }];
      const state = { version: '1.0.0' };
      
      const data = collectConfigData(items, state);
      expect(data).toEqual({ version: '1.0.0' });
    });

    it('空配置项时返回空对象', () => {
      const items: any[] = [];
      const data = collectConfigData(items, {});
      expect(data).toEqual({});
    });

    it('field 不存在于 state 中的配置项返回 "-"', () => {
      const items = [{
        title: '信息',
        children: [
          { label: '版本号', field: 'version' },
          { label: '不存在', field: 'notExist' }
        ]
      }];
      const state = { version: '1.0.0' };
      
      const data = collectConfigData(items, state);
      expect(data).toEqual({
        version: '1.0.0',
        notExist: '-'
      });
    });
  });
});