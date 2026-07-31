<template>
  <div class="demo-page">
    <h1>vConsole Config Panel 基础示例</h1>
    <p data-intro>点击右下角 vConsole 按钮，切换到「配置面板」查看效果。</p>

    <div class="status-card">
      <h2>当前状态</h2>
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </div>

    <div class="actions">
      <button @click="randomizeEnv">切换环境</button>
      <button @click="resetState">重置状态</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VConsole from 'vconsole';
import VConsoleConfigPanel from '@/lib/index';

interface State {
  appId: string;
  version: string;
  env: string;
  apiBase: string;
  token: string;
}

const state = ref<State>({
  appId: 'wx123456',
  version: '1.2.3',
  env: 'development',
  apiBase: 'https://dev.example.com',
  token: 'dev-token-001',
});

const useState = () => state.value;
const setState = (data: Partial<State>) => {
  Object.assign(state.value, data);
};

const items = [
  {
    title: '应用信息',
    children: [
      { label: 'AppID', field: 'appId' },
      { label: '版本', field: 'version' },
      { label: '当前环境', field: 'env' },
    ],
  },
  {
    title: '运行时配置',
    children: [
      { label: 'API 地址', field: 'apiBase' },
      { label: 'Token', field: 'token' },
    ],
  },
];

onMounted(() => {
  const vc = new VConsole();
  const panel = VConsoleConfigPanel({
    id: 'config-panel',
    name: '配置面板',
    items,
    useState,
    setState,
  });
  vc.addPlugin(panel);
});

function randomizeEnv() {
  const envs = [
    { env: 'development', apiBase: 'https://dev.example.com', token: 'dev-token-001' },
    { env: 'testing', apiBase: 'https://test.example.com', token: 'test-token-002' },
    { env: 'production', apiBase: 'https://api.example.com', token: 'prod-token-003' },
  ];
  const next = envs[Math.floor(Math.random() * envs.length)];
  setState(next);
}

function resetState() {
  setState({
    appId: 'wx123456',
    version: '1.2.3',
    env: 'development',
    apiBase: 'https://dev.example.com',
    token: 'dev-token-001',
  });
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

.actions {
  display: flex;
  gap: 12px;
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
