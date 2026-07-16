<template>
  <div id="app">
    <h1>vConsole Config Panel Demo</h1>
    <div class="instructions">
      <p><strong>说明：</strong>这是一个用于UI自动化测试的演示页面。</p>
      <p>打开vConsole后，您可以在"Config Panel"选项卡中查看和测试配置面板功能。</p>
    </div>

    <div class="controls">
      <h3>Test Controls</h3>
      <button @click="updateConfig" class="btn">Update Config</button>
      <button @click="addNewConfig" class="btn">Add New Config Item</button>
      <button @click="toggleDarkMode" class="btn">Toggle Dark Mode</button>
    </div>

    <div class="config-panel">
      <h2>Configuration Options</h2>
      <div class="form-group">
        <label>
          <input
            type="checkbox"
            v-model="config.showVConsole"
            @change="toggleVConsole"
          />
          Show vConsole
        </label>
      </div>

      <div class="form-group">
        <label>
          Theme:
          <select v-model="config.theme" @change="changeTheme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>

      <div class="form-group">
        <label>
          Position:
          <select v-model="config.position" @change="changePosition">
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </label>
      </div>

      <div class="form-group">
        <label>
          Auto Clean Local Storage:
          <input
            type="checkbox"
            v-model="config.autoCleanLocalstorage"
          />
        </label>
      </div>
    </div>

    <div class="current-config">
      <h3>Current Configuration:</h3>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>

    <div class="time-display">
      <h3>Current Time: <span id="currentTimestamp">{{ currentTime }}</span></h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useConfigStore } from './store';
import VConsoleConfigPanel from '../src/index';

// Reactive reference for current time
const currentTime = ref(new Date().toISOString())

// Update time every second
setInterval(() => {
  currentTime.value = new Date().toISOString()
}, 1000)

const store = useConfigStore();
const config = reactive({
  showVConsole: store.showVConsole,
  theme: store.theme as 'light' | 'dark',
  position: store.position,
  autoCleanLocalstorage: store.autoCleanLocalstorage,
  appName: 'Test App',
  version: '1.0.0',
  env: 'development',
  apiUrl: 'https://api.example.com',
  debugMode: true,
  maxRetries: 3,
  timeout: 5000,
  features: ['feature1', 'feature2'],
  timestamp: Date.now(),
  dynamicValue: Math.floor(Math.random() * 100)
});

let vConsoleInstance: any = null;

onMounted(async () => {
  // Initialize vConsole if showVConsole is true
  if (config.showVConsole) {
    await initVConsole();
  }
});

const toggleVConsole = async () => {
  store.setShowVConsole(config.showVConsole);
  if (config.showVConsole) {
    await initVConsole();
  } else {
    destroyVConsole();
  }
};

const changeTheme = () => {
  store.setTheme(config.theme);
  // Apply theme changes to vConsole if it's initialized
  if (vConsoleInstance) {
    if (config.theme === 'dark') {
      vConsoleInstance.setOption('theme', 'dark');
    } else {
      vConsoleInstance.setOption('theme', 'light');
    }
  }
};

const changePosition = () => {
  store.setPosition(config.position);
  // Apply position changes to vConsole if it's initialized
  if (vConsoleInstance) {
    // vConsole position change implementation would go here
  }
};

const initVConsole = async () => {
  const { default: VConsole } = await import('vconsole');
  if (!(window as any).vConsole) {
    const vConsole = new VConsole({ theme: config.theme });

    // 添加我们的配置面板插件
    const configPanel = VConsoleConfigPanel({
      id: 'config',
      name: 'Config Panel',
      items: [
        {
          title: 'Basic Info',
          children: [
            { label: 'App Name', field: 'appName' },
            { label: 'Version', field: 'version' },
            { label: 'Environment', field: 'env' },
            { label: 'API URL', field: 'apiUrl' }
          ]
        },
        {
          title: 'Advanced Settings',
          children: [
            { label: 'Debug Mode', field: 'debugMode' },
            { label: 'Max Retries', field: 'maxRetries' },
            { label: 'Timeout (ms)', field: 'timeout' },
            { label: 'Features', field: 'features' }
          ]
        },
        {
          title: 'System Info',
          children: [
            { 
              label: 'Timestamp', 
              getValue: () => new Date().toISOString() 
            },
            { 
              label: 'Random Value', 
              getValue: () => Math.floor(Math.random() * 1000) 
            },
            { 
              label: 'Dynamic Value', 
              field: 'dynamicValue'
            }
          ]
        }
      ],
      useState: () => ({ ...config }),
      setState: (newState) => {
        Object.assign(config, newState);
      }
    });

    vConsole.addPlugin(configPanel);
    (window as any).vConsole = vConsole;
    vConsoleInstance = vConsole;
  }
};

const destroyVConsole = () => {
  if ((window as any).vConsole) {
    (window as any).vConsole.destroy();
    (window as any).vConsole = null;
    vConsoleInstance = null;
  }
};

// Methods for UI controls
const updateConfig = () => {
  config.version = `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
  config.timestamp = Date.now()
  config.dynamicValue = Math.floor(Math.random() * 100)
  console.log('Configuration updated:', config)
}

const addNewConfig = () => {
  (config as any)['newFeature'] = `Feature_${Date.now()}`
  console.log('New configuration added:', config)
}

const toggleDarkMode = () => {
  // Toggle vConsole theme
  if (vConsoleInstance) {
    if (vConsoleInstance.option.theme === 'dark') {
      vConsoleInstance.setOption('theme', 'light')
    } else {
      vConsoleInstance.setOption('theme', 'dark')
    }
  }
};
</script>

<style scoped>
#app {
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

.config-panel {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-config {
  border: 1px solid #eee;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

pre {
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.time-display {
  margin-top: 20px;
  padding: 15px;
  background-color: #e8f4fd;
  border-radius: 5px;
}
</style>