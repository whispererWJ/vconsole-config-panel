var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { encryptData as encryptDataWithCrypto, decryptData } from './crypto';
// 生成唯一ID - 使用下划线链接
let panelIdCounter = 0;
function generatePanelId() {
    return 'vconsole_panel_' + (++panelIdCounter) + '_' + Date.now();
}
/**
 * 获取配置项的值
 */
export function getItemValue(item, state) {
    var _a;
    if (item.getValue) {
        const result = item.getValue();
        return String(result !== null && result !== void 0 ? result : '');
    }
    if (item.field && state[item.field] !== undefined) {
        return String((_a = state[item.field]) !== null && _a !== void 0 ? _a : '');
    }
    return '-';
}
/**
 * 生成配置面板的HTML结构 - 返回 { html, panelId }
 */
export function generateHtmlWithId(items, state = {}) {
    const panelId = generatePanelId();
    let html = `<div class="vconsole-config-panel" id="${panelId}" data-panel-id="${panelId}">`;
    for (const group of items) {
        html += `
      <div class="config-group">
        <div class="config-group-title">${escapeHtml(group.title)}</div>
        <div class="config-group-items">
    `;
        for (const item of group.children) {
            const value = getItemValue(item, state);
            html += `
        <div class="config-item" data-field="${escapeHtml(item.field || '')}">
          <span class="config-label">${escapeHtml(item.label)}</span>
          <span class="config-value">${escapeHtml(value)}</span>
        </div>
      `;
        }
        html += `
        </div>
      </div>
    `;
    }
    // 添加操作按钮
    html += `
    <div class="config-actions">
      <button class="config-btn" data-action="refresh">🔄 刷新</button>
      <button class="config-btn" data-action="copy">📋 复制配置</button>
      <button class="config-btn" data-action="import">📥 导入配置</button>
    </div>
  `;
    html += '</div>';
    console.log('🎨 generateHtmlWithId 生成面板, panelId:', panelId);
    return { html, panelId };
}
// 兼容旧接口 - 保持向后兼容
export function generateHtml(items, state = {}) {
    return generateHtmlWithId(items, state).html;
}
/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
/**
 * 复制文本到剪贴板
 */
export function copyToClipboard(text) {
    console.log('📋 copyToClipboard 被调用, 文本长度:', text.length);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text).catch(function (err) {
            console.warn('Clipboard API 失败，使用备用方法:', err);
            return fallbackCopy(text);
        });
    }
    return fallbackCopy(text);
}
/**
 * 备用复制方法
 */
function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            textarea.style.width = '1px';
            textarea.style.height = '1px';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (success) {
                resolve();
            }
            else {
                reject(new Error('复制失败'));
            }
        }
        catch (err) {
            reject(err);
        }
    });
}
/**
 * 收集所有配置项的值
 */
export function collectConfigData(items, state) {
    const data = {};
    for (const group of items) {
        for (const item of group.children) {
            if (item.field) {
                const key = item.field;
                data[key] = getItemValue(item, state);
            }
        }
    }
    return data;
}
/**
 * 使用加密模块加密数据
 */
export function encryptDataWithConfig(data, encryption) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔐 encryptDataWithConfig 被调用, encryption:', !!encryption);
        if (!encryption || !encryption.aes) {
            return JSON.stringify(data, null, 2);
        }
        try {
            const { aes, rsa } = encryption;
            const encrypted = yield encryptDataWithCrypto(data, aes, rsa);
            return JSON.stringify({
                encrypted: true,
                algorithm: {
                    aes: !!aes,
                    rsa: !!rsa
                },
                data: encrypted,
                timestamp: Date.now()
            }, null, 2);
        }
        catch (error) {
            console.error('加密失败，使用明文:', error);
            return JSON.stringify(data, null, 2);
        }
    });
}
/**
 * 解密数据
 */
export function decryptDataWithConfig(encryptedStr, encryption) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!encryption) {
            return JSON.parse(encryptedStr);
        }
        try {
            const parsed = JSON.parse(encryptedStr);
            if (!parsed.encrypted || !parsed.data) {
                return parsed;
            }
            const { aes, rsa } = encryption;
            const decrypted = yield decryptData(parsed.data, aes, rsa);
            return decrypted;
        }
        catch (error) {
            console.error('解密失败:', error);
            throw new Error('解密失败，请检查加密配置是否正确');
        }
    });
}
/**
 * 显示Toast提示
 */
export function showToast(container, message, type) {
    console.log('💬 showToast:', message, type);
    // 移除已存在的toast
    const existingToasts = document.querySelectorAll('.config-toast');
    existingToasts.forEach(function (toast) {
        toast.remove();
    });
    const toast = document.createElement('div');
    toast.className = 'config-toast';
    toast.textContent = message;
    const colors = {
        success: 'rgba(16, 185, 129, 0.95)',
        error: 'rgba(239, 68, 68, 0.95)',
        info: 'rgba(59, 130, 246, 0.95)'
    };
    const bgColor = type ? colors[type] : colors.info;
    toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColor};
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 99999;
    max-width: 80%;
    white-space: nowrap;
    animation: fadeIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
  `;
    document.body.appendChild(toast);
    setTimeout(function () {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}
/**
 * 通过panelId初始化面板
 */
export function initPanelById(panelId, items, useState, setState, encryption) {
    console.log('🔧 ========== initPanelById 开始 ==========');
    console.log('🔧 panelId:', panelId);
    // 通过ID查找面板
    const panel = document.getElementById(panelId);
    if (!panel) {
        console.error('❌ 未找到面板元素, panelId:', panelId);
        // 打印所有可能的元素帮助调试
        const allPanels = document.querySelectorAll('.vconsole-config-panel');
        console.log('🔍 找到的所有 .vconsole-config-panel:', allPanels.length);
        allPanels.forEach(function (p, i) {
            console.log(`  [${i}] id: "${p.id}", class: "${p.className}"`);
        });
        return;
    }
    console.log('✅ 找到面板元素:', panel);
    console.log('📄 面板内容长度:', panel.innerHTML.length);
    console.log('📄 面板子元素数量:', panel.children.length);
    // 检查是否已经绑定过事件
    if (panel.__vconsole_binded) {
        console.log('🔗 面板已绑定过事件，跳过');
        return;
    }
    // 绑定事件
    bindPanelEvents(panel, items, useState, setState, encryption);
}
/**
 * 绑定面板事件 - 使用事件委托
 */
function bindPanelEvents(panel, items, useState, setState, encryption) {
    console.log('🔗 ========== bindPanelEvents 开始 ==========');
    console.log('🔗 panel.id:', panel.id);
    // 检查是否已经绑定过
    if (panel.__vconsole_binded) {
        console.log('🔗 面板已绑定过事件，跳过');
        return;
    }
    panel.__vconsole_binded = true;
    // ---- 使用事件委托监听所有点击事件 ----
    panel.addEventListener('click', function (event) {
        const target = event.target;
        // 检查是否点击了按钮
        const button = target.closest('.config-btn');
        if (button) {
            const action = button.getAttribute('data-action');
            console.log('🖱️ 按钮点击 (事件委托):', action, button);
            event.stopPropagation();
            event.preventDefault();
            switch (action) {
                case 'refresh':
                    handleRefreshAction(panel, items, useState);
                    break;
                case 'copy':
                    handleCopyAction(panel, items, useState, encryption);
                    break;
                case 'import':
                    handleImportAction(panel, items, useState, setState, encryption);
                    break;
                default:
                    console.warn('未知操作:', action);
                    showToast(panel, '⚠️ 未知操作: ' + action, 'error');
            }
            return;
        }
        // 检查是否点击了配置项（复制单个值）
        const configItem = target.closest('.config-item');
        if (configItem) {
            if (target.closest('.config-btn'))
                return;
            const valueEl = configItem.querySelector('.config-value');
            if (valueEl) {
                const text = valueEl.textContent || '';
                console.log('🖱️ 点击配置项: ' + text);
                if (text && text !== '-') {
                    copyToClipboard(text).then(function () {
                        showToast(panel, '✅ 已复制: ' + text, 'success');
                    }).catch(function (err) {
                        showToast(panel, '❌ 复制失败', 'error');
                        console.error('复制失败:', err);
                    });
                }
            }
        }
    });
    console.log('🔗 事件委托绑定完成');
    console.log('🔗 ========== bindPanelEvents 结束 ==========');
}
/**
 * 处理刷新操作
 */
function handleRefreshAction(panel, items, useState) {
    console.log('🔄 ========== 执行刷新操作 ==========');
    refreshPanelData(panel, items, useState);
    showToast(panel, '🔄 已刷新配置', 'success');
}
/**
 * 处理复制操作
 */
function handleCopyAction(panel, items, useState, encryption) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📋 ========== 执行复制操作 ==========');
        try {
            const currentState = useState ? useState() : {};
            console.log('📊 当前状态:', currentState);
            const data = collectConfigData(items, currentState);
            console.log('📋 收集的配置数据:', data);
            const text = yield encryptDataWithConfig(data, encryption);
            console.log('📝 要复制的数据长度:', text.length);
            yield copyToClipboard(text);
            showToast(panel, '✅ 配置已复制到剪贴板', 'success');
            console.log('✅ 复制成功');
        }
        catch (err) {
            console.error('复制失败:', err);
            showToast(panel, '❌ 复制失败: ' + err.message, 'error');
        }
    });
}
/**
 * 处理导入操作
 */
function handleImportAction(panel, items, useState, setState, encryption) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📥 ========== 执行导入操作 ==========');
        try {
            let clipboardText = '';
            if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
                clipboardText = yield navigator.clipboard.readText();
                console.log('📥 从剪贴板读取到数据，长度:', clipboardText.length);
            }
            else {
                showToast(panel, '⚠️ 当前浏览器不支持剪贴板读取，请手动粘贴', 'error');
                return;
            }
            if (!clipboardText) {
                showToast(panel, '⚠️ 未读取到剪贴板内容', 'error');
                return;
            }
            console.log('📥 读取到的数据:', clipboardText.substring(0, 200) + '...');
            let decryptedData;
            try {
                decryptedData = yield decryptDataWithConfig(clipboardText, encryption);
                console.log('📥 解密后的数据:', decryptedData);
            }
            catch (e) {
                try {
                    decryptedData = JSON.parse(clipboardText);
                    console.log('📥 直接解析JSON数据:', decryptedData);
                }
                catch (e2) {
                    showToast(panel, '❌ 数据格式错误，请检查', 'error');
                    console.error('解析失败:', e2);
                    return;
                }
            }
            if (setState && typeof setState === 'function') {
                const currentState = useState ? useState() : {};
                const mergedState = Object.assign(Object.assign({}, currentState), decryptedData);
                setState(mergedState);
                showToast(panel, '✅ 配置导入成功', 'success');
                refreshPanelData(panel, items, useState);
                console.log('✅ 导入成功，新状态:', mergedState);
            }
            else {
                showToast(panel, '⚠️ 未配置状态更新函数', 'error');
                console.warn('setState 未配置');
            }
        }
        catch (err) {
            console.error('导入失败:', err);
            showToast(panel, '❌ 导入失败: ' + err.message, 'error');
        }
    });
}
/**
 * 刷新面板数据
 */
export function refreshPanelData(panel, items, useState) {
    console.log('🔄 ========== refreshPanelData 被调用 ==========');
    const state = useState ? useState() : {};
    const valueElements = panel.querySelectorAll('.config-item .config-value');
    console.log('📊 当前状态:', state);
    console.log('📊 找到 ' + valueElements.length + ' 个值元素');
    let index = 0;
    for (const group of items) {
        for (const item of group.children) {
            if (index < valueElements.length) {
                const newValue = getItemValue(item, state);
                valueElements[index].textContent = newValue;
                console.log(`  [${index}] ${item.label}: ${newValue}`);
                index++;
            }
        }
    }
}
// 兼容旧接口
export function initPanel(container, items, useState, setState, encryption) {
    const panel = container.querySelector('.vconsole-config-panel');
    if (panel && panel.id) {
        initPanelById(panel.id, items, useState, setState, encryption);
    }
    else {
        console.warn('⚠️ 未找到面板元素，尝试直接绑定');
        bindPanelEvents(container, items, useState, setState, encryption);
    }
}
export { refreshPanelData as refreshPanel };
