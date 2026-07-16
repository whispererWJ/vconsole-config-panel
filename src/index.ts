// src/index.ts
import VConsole from 'vconsole';
import type { PanelOptions } from './types';
import { styles } from './styles';
import {
  generateHtmlWithId,
  initPanelById,
  refreshPanelData,
  showToast,
  encryptDataWithConfig,
  decryptDataWithConfig
} from './helper';

// 导出加密工具
export * from './crypto';

const STYLE_ID = 'vconsole-config-panel-styles';

/**
 * 创建vConsole配置面板插件
 */
function VConsoleConfigPanel(options: PanelOptions): any {
  const { id, name, items, useState, setState, encryption } = options;

  // 在插件函数作用域中声明 panelId
  let panelId: string | null = null;
  let observer: MutationObserver | null = null;
  let isInitialized = false;

  // 注入样式
  if (!document.getElementById(STYLE_ID)) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  const VConsolePlugin = (VConsole as any).VConsolePlugin;
  const plugin = new VConsolePlugin(id, name);

  /**
   * 尝试初始化面板
   */
  function tryInitPanel(): boolean {
    if (isInitialized) {
      return true;
    }

    if (!panelId) {
      console.warn('⚠️ panelId 为空，无法初始化');
      return false;
    }

    // 尝试多种方式查找面板
    let panel = document.getElementById(panelId);
    
    if (!panel) {
      console.log('🔍 通过ID查找失败，尝试通过 data-panel-id 查找');
      panel = document.querySelector(`[data-panel-id="${panelId}"]`) as HTMLElement;
    }
    
    if (!panel) {
      console.log('🔍 通过 data-panel-id 查找失败，尝试查找所有 .vconsole-config-panel');
      const allPanels = document.querySelectorAll('.vconsole-config-panel');
      console.log('🔍 找到 ' + allPanels.length + ' 个 .vconsole-config-panel');
      for (let i = 0; i < allPanels.length; i++) {
        const p = allPanels[i] as HTMLElement;
        const pid = p.getAttribute('data-panel-id') || p.id;
        console.log(`  [${i}] id: "${p.id}", data-panel-id: "${p.getAttribute('data-panel-id')}"`);
        if (pid === panelId) {
          panel = p;
          console.log(`✅ 通过遍历找到匹配的面板: [${i}]`);
          break;
        }
      }
    }

    if (panel) {
      console.log('✅ 找到面板元素, panelId:', panelId);
      console.log('📄 panel.id:', panel.id);
      console.log('📄 panel.className:', panel.className);
      console.log('📄 panel 子元素数量:', panel.children.length);
      
      // 断开 observer，不再继续监听
      if (observer) {
        observer.disconnect();
        observer = null;
        console.log('🔌 MutationObserver 已断开');
      }
      
      isInitialized = true;
      initPanelById(panelId, items, useState, setState, encryption);
      return true;
    }
    
    console.log('🔍 MutationObserver 检查: 面板尚未出现, panelId:', panelId);
    return false;
  }

  /**
   * 设置 MutationObserver 监听 DOM 变化
   */
  function setupObserver(): void {
    // 如果已经初始化，直接返回
    if (isInitialized) {
      console.log('✅ 面板已初始化，跳过 observer');
      return;
    }

    // 如果已经存在 observer，先断开
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // 先尝试直接查找
    if (tryInitPanel()) {
      return;
    }

    console.log('🔧 设置 MutationObserver 监听面板出现, panelId:', panelId);

    // 监听整个 body 的变化，包括所有子节点
    observer = new MutationObserver(function(mutations) {
      // 检查是否有新增节点或属性变化
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        // 有新增节点
        if (mutation.addedNodes.length > 0) {
          shouldCheck = true;
          break;
        }
        // 有属性变化（可能是 id 或 data-* 属性被设置）
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (target.classList && target.classList.contains('vconsole-config-panel')) {
            shouldCheck = true;
            break;
          }
        }
      }
      
      if (shouldCheck) {
        console.log('🔔 MutationObserver 检测到 DOM 变化');
        // 延迟一帧执行，确保 DOM 完全更新
        requestAnimationFrame(function() {
          tryInitPanel();
        });
      }
    });

    // 监听多种变化：子节点变化、属性变化、子树变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class', 'data-panel-id']
    });

    console.log('✅ MutationObserver 已启动 (监听 subtree 和 attributes)');
    
    // 设置超时保护，防止 observer 一直监听
    setTimeout(function() {
      if (!isInitialized && observer) {
        console.log('⏰ 5秒超时，最后一次尝试查找面板');
        tryInitPanel();
        // 无论是否找到，断开 observer
        if (observer) {
          observer.disconnect();
          observer = null;
          console.log('🔌 MutationObserver 超时断开');
        }
      }
    }, 5000);
  }

  // 渲染Tab内容 - 生成带唯一ID的HTML，并赋值给 panelId
  plugin.on('renderTab', (callback: (html: string) => void) => {
    const state = useState ? useState() : {};
    const result = generateHtmlWithId(items, state);
    
    // 在 renderTab 中赋值 panelId
    panelId = result.panelId;
    console.log('🎨 renderTab 生成面板, panelId:', panelId);
    
    callback(result.html);
  });

  // ready事件：设置 MutationObserver 监听面板出现
  plugin.on('ready', () => {
    console.log('✅ ready 事件触发, id:', id);
    console.log('🔍 当前 panelId:', panelId);
    
    if (panelId) {
      // 设置 MutationObserver 监听面板出现
      setupObserver();
    } else {
      console.error('❌ panelId 为空，无法监听');
    }
  });

  // show事件：刷新数据
  plugin.on('show', () => {
    console.log('👁️ show 事件触发, id:', id);
    console.log('🔍 当前 panelId:', panelId);
    console.log('🔍 isInitialized:', isInitialized);
    
    if (panelId) {
      // 如果尚未初始化，尝试初始化
      if (!isInitialized) {
        console.log('🔧 show 事件触发但面板未初始化，尝试初始化');
        setupObserver();
        // 直接尝试查找
        tryInitPanel();
      }
      
      const panel = document.getElementById(panelId);
      if (panel) {
        refreshPanelData(panel, items, useState);
      } else {
        console.warn('⚠️ 面板不存在:', panelId);
        // 尝试通过 data-panel-id 查找
        const panelByData = document.querySelector(`[data-panel-id="${panelId}"]`) as HTMLElement;
        if (panelByData) {
          console.log('✅ 通过 data-panel-id 找到面板');
          refreshPanelData(panelByData, items, useState);
        } else {
          // 如果面板不存在，重新设置 observer
          if (!observer && !isInitialized) {
            setupObserver();
          }
        }
      }
    } else {
      console.warn('⚠️ panelId 为空');
    }
  });

  console.log('📦 插件创建完成, id:', id);
  return plugin;
}

// 默认导出
export default VConsoleConfigPanel;

// 导出类型
export type {
  PanelOptions,
  ConfigGroup,
  ConfigItem,
  EncryptionConfig,
  AESConfig,
  RSAConfig,
} from './types';

// 导出工具函数
export {
  showToast,
  refreshPanelData as refreshPanel,
  encryptDataWithConfig,
  decryptDataWithConfig,
  copyToClipboard,
  collectConfigData
} from './helper';