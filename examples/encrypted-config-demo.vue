<template>
  <div id="encrypted-config-app">
    <h1>vConsole Config Panel Encrypted UI Test</h1>
    
    <div class="instructions">
      <p><strong>说明：</strong>这是一个用于测试加密配置面板功能的演示页面。</p>
      <p>此示例展示了如何使用AES加密配置数据。</p>
    </div>
    
    <div class="warning">
      <strong>注意：</strong>此示例使用固定的加密密钥，仅用于测试目的。在生产环境中，请使用安全的密钥管理方案。
    </div>
    
    <div class="controls">
      <h3>Test Controls</h3>
      <button @click="updateSensitiveConfig" class="btn">Update Sensitive Config</button>
      <button @click="toggleEncryption" class="btn">Toggle Encryption Status</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import VConsole from 'vconsole';
import VConsoleConfigPanel from '../src/index';

// 初始化全局状态
const sensitiveConfig = {
  apiKey: 'sk-1234567890abcdef',
  dbPassword: 'secure_password_123',
  secretToken: 'token_abc_def_ghi',
  appSecret: 'my_secret_app_key',
  oauthClientId: 'client_12345',
  oauthClientSecret: 'secret_67890'
};

// AES加密配置
const aesConfig = {
  key: '1234567890123456', // 16字节密钥
  iv: '1234567890123456'  // 16字节IV
};

onMounted(() => {
  // 初始化vConsole
  const vConsole = new VConsole({
    defaultPlugins: ['system', 'network', 'element', 'storage'],
    onReady: function() {
      console.log('vConsole is ready!');
      
      // 添加加密配置面板插件
      const encryptedConfigPanel = VConsoleConfigPanel({
        id: 'config-encrypted',
        name: 'Encrypted Config',
        useState: () => sensitiveConfig,
        setState: (newState) => {
          Object.assign(sensitiveConfig, newState);
        },
        encryption: {
          aes: aesConfig
        },
        items: [
          {
            title: 'API Credentials',
            children: [
              { label: 'API Key', field: 'apiKey' },
              { label: 'Secret Token', field: 'secretToken' }
            ]
          },
          {
            title: 'Database Settings',
            children: [
              { label: 'DB Password', field: 'dbPassword' },
              { label: 'App Secret', field: 'appSecret' }
            ]
          },
          {
            title: 'OAuth Configuration',
            children: [
              { label: 'Client ID', field: 'oauthClientId' },
              { label: 'Client Secret', field: 'oauthClientSecret' }
            ]
          }
        ]
      });
      
      vConsole.addPlugin(encryptedConfigPanel);
    }
  });
});

// 页面交互功能
const updateSensitiveConfig = () => {
  sensitiveConfig.apiKey = `sk-${Date.now()}-test`;
  sensitiveConfig.secretToken = `token-${Math.random().toString(36).substring(2, 11)}`;
  console.log('Sensitive configuration updated:', sensitiveConfig);
};

const toggleEncryption = () => {
  alert('Encryption is always enabled in this demo. In a real app, you would toggle encryption on/off.');
};
</script>

<style scoped>
#encrypted-config-app {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f5f5f5;
}

.instructions {
  background: #eef7ff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.warning {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.controls {
  background: #eef7ff;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

.btn:hover {
  background: #0056b3;
}
</style>