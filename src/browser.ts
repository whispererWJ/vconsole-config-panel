// src/browser.ts
import VConsoleConfigPanel from './index';
import * as crypto from './crypto';
import * as helper from './helper';

// 在浏览器环境中挂载到window
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.VConsoleConfigPanel = VConsoleConfigPanel;
  // @ts-ignore
  window.VConsoleConfigPanelUtils = {
    ...crypto,
    encryptData: helper.encryptDataWithConfig,
    decryptData: helper.decryptDataWithConfig,
    showToast: helper.showToast,
    copyToClipboard: helper.copyToClipboard,
    collectConfigData: helper.collectConfigData
  };
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