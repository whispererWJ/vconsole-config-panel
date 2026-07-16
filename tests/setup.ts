// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟 crypto 对象
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      importKey: vi.fn().mockResolvedValue({}),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      generateKey: vi.fn().mockResolvedValue({
        publicKey: {},
        privateKey: {}
      }),
      exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(16))
    }
  },
  configurable: true
});

// 模拟 navigator.clipboard
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('{"test":"data"}')
  },
  configurable: true
});

// 模拟 document.execCommand
document.execCommand = vi.fn().mockReturnValue(true);

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});