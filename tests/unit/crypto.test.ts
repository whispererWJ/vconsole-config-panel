// tests/unit/crypto.test.ts
import { describe, it, expect } from 'vitest';
import { encryptData } from '../../src/crypto';

describe('crypto 加密模块', () => {
  describe('encryptData / decryptData', () => {
    it('没有加密配置时直接返回 JSON 字符串', async () => {
      const data = { test: 'Hello', number: 123 };
      
      const result = await encryptData(data);
      expect(result).toBe(JSON.stringify(data));
    });

    it('空数据时返回空对象 JSON', async () => {
      const data = {};
      
      const result = await encryptData(data);
      expect(result).toBe('{}');
    });

    it('包含特殊字符的数据能正确序列化', async () => {
      const data = { 
        test: 'Hello "World"',
        emoji: '🚀',
        special: '\n\t\r'
      };
      
      const result = await encryptData(data);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(data);
    });
  });
});