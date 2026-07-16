// src/styles.ts
export const styles = `
  .vconsole-config-panel {
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .vconsole-config-panel .config-group {
    margin-bottom: 16px;
    background: #f5f7fa;
    border-radius: 6px;
    overflow: hidden;
  }

  .vconsole-config-panel .config-group-title {
    padding: 8px 12px;
    background: #e8ecf1;
    font-weight: 600;
    font-size: 13px;
    color: #555;
  }

  .vconsole-config-panel .config-group-items {
    padding: 4px 0;
  }

  .vconsole-config-panel .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid #eef1f5;
    transition: background 0.15s;
  }

  .vconsole-config-panel .config-item:last-child {
    border-bottom: none;
  }

  .vconsole-config-panel .config-item:hover {
    background: #eef3f8;
  }

  .vconsole-config-panel .config-label {
    color: #666;
    font-size: 13px;
    flex-shrink: 0;
    margin-right: 16px;
  }

  .vconsole-config-panel .config-value {
    color: #1a73e8;
    font-weight: 500;
    font-size: 13px;
    word-break: break-all;
    text-align: right;
    max-width: 60%;
    font-family: 'Courier New', monospace;
  }

  .vconsole-config-panel .config-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 12px 0 8px;
    border-top: 1px solid #e8ecf1;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .vconsole-config-panel .config-actions button {
    padding: 6px 16px;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    background: #fff;
    color: #333;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    min-width: 80px;
    max-width: 140px;
  }

  .vconsole-config-panel .config-actions button:hover {
    background: #f0f4f9;
    border-color: #b0b8c4;
  }

  .vconsole-config-panel .config-actions button:active {
    transform: scale(0.96);
  }

  .vconsole-config-panel .config-actions .config-btn-import {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
  }

  .vconsole-config-panel .config-actions .config-btn-import:hover {
    background: #fde68a;
    border-color: #d97706;
  }

  .config-toast {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) scale(0.8); }
    to { opacity: 1; transform: translateX(-50%) scale(1); }
  }

  /* 暗色主题适配 */
  .vc-dark .vconsole-config-panel {
    color: #e8e8e8;
  }

  .vc-dark .vconsole-config-panel .config-group {
    background: #2a2a2a;
  }

  .vc-dark .vconsole-config-panel .config-group-title {
    background: #333;
    color: #ccc;
  }

  .vc-dark .vconsole-config-panel .config-item {
    border-bottom-color: #333;
  }

  .vc-dark .vconsole-config-panel .config-item:hover {
    background: #2a2a2a;
  }

  .vc-dark .vconsole-config-panel .config-label {
    color: #aaa;
  }

  .vc-dark .vconsole-config-panel .config-value {
    color: #6ea8fe;
  }

  .vc-dark .vconsole-config-panel .config-actions {
    border-top-color: #333;
  }

  .vc-dark .vconsole-config-panel .config-actions button {
    background: #333;
    border-color: #444;
    color: #e8e8e8;
  }

  .vc-dark .vconsole-config-panel .config-actions button:hover {
    background: #3a3a3a;
    border-color: #555;
  }

  .vc-dark .vconsole-config-panel .config-actions .config-btn-import {
    background: #422c0a;
    border-color: #78350f;
    color: #fbbf24;
  }

  .vc-dark .vconsole-config-panel .config-actions .config-btn-import:hover {
    background: #5b3a0e;
    border-color: #92400e;
  }
`;