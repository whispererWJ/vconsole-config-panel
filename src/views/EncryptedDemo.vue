<template>
  <div class="demo-page">
    <h1>vConsole Config Panel 加密示例</h1>
    <p data-intro>本示例演示「复制配置」与「导入配置」时的 AES+RSA 加密能力。</p>

    <div class="status-card">
      <h2>当前状态</h2>
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </div>

    <div class="actions">
      <button @click="rotateToken">刷新 Token</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VConsole from 'vconsole';
import VConsoleConfigPanel from '@/lib/index';
import { generateRSAKeyPair } from '@/lib/crypto';

interface State {
  appId: string;
  secret: string;
  featureFlag: string;
}

const state = ref<State>({
  appId: 'app-encrypted-01',
  secret: 'my-super-secret',
  featureFlag: 'enabled',
});

const useState = () => state.value;
const setState = (data: Partial<State>) => {
  Object.assign(state.value, data);
};

const items = [
  {
    title: '加密配置区',
    children: [
      { label: '应用 ID', field: 'appId' },
      { label: '密钥', field: 'secret' },
      { label: '特性开关', field: 'featureFlag' },
    ],
  },
];

/**
 * 生成指定长度的随机字节串（用于 AES key/iv）
 * 仅使用可打印 ASCII，保证 TextEncoder 后长度与目标一致。
 */
function generateRandomBytes(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

async function initPanel() {
  const pair = await generateRSAKeyPair();

  const vc = new VConsole();
  const panel = VConsoleConfigPanel({
    id: 'encrypted-config-panel',
    name: '加密配置',
    items,
    useState,
    setState,
    encryption: {
      aes: {
        key: generateRandomBytes(32),
        iv: generateRandomBytes(16),
      },
      rsa: {
        publicKey: pair.publicKey,
        privateKey: pair.privateKey,
      },
    },
  });
  vc.addPlugin(panel);
}

onMounted(() => {
  initPanel().catch((err) => console.error('初始化加密面板失败:', err));
});

function rotateToken() {
  setState({ secret: `secret-${Date.now()}` });
}
</script>

<style scoped>
.demo-page {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  font-size: 22px;
  margin-bottom: 8px;
}

p {
  color: #666;
  margin-bottom: 24px;
}

.status-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.status-card h2 {
  font-size: 16px;
  margin: 0 0 12px;
}

pre {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
}

.actions button {
  padding: 8px 16px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.actions button:hover {
  background: #f0f4f9;
}
</style>
