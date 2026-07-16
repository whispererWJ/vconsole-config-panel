# vConsole Config Panel AI 辅助开发指南

## 项目概述

vConsole Config Panel 是一个用于 vConsole 的配置信息显示面板插件，支持自定义配置项、动态刷新和复制功能。

### 主要特性
- 零依赖 - 不依赖任何前端框架
- 一键复制 - 支持复制单个配置项或全部配置
- 动态刷新 - 支持实时更新配置数据
- 主题适配 - 自动适配 vConsole 的亮色/暗色主题
- TypeScript - 完整的类型支持
- 数据加密 - 支持复制时加密配置数据（可选）
- 灵活配置 - 支持 `field` 和 `getValue` 两种取值方式

## 代码结构

```
src/
├── index.ts        # 主入口文件，包含核心插件逻辑
├── types.ts        # 类型定义
├── styles.ts       # 样式定义
├── helper.ts       # 工具函数（DOM操作、数据刷新、加密等）
├── crypto.ts       # 加密解密工具
└── browser.ts      # 浏览器兼容性相关代码
```

## 核心功能实现

### 1. 插件初始化机制
- 使用 vConsole 插件系统创建自定义面板
- 通过 MutationObserver 监听面板 DOM 的创建
- 实现了多重查找策略来定位面板元素

### 2. 配置项渲染
- 支持分组显示配置项
- 提供两种数据获取方式：
  - `field`: 直接从状态对象获取指定字段
  - `getValue`: 使用自定义函数获取值

### 3. 数据更新与刷新
- 实现了动态刷新功能，支持实时更新配置数据
- 在面板显示时自动刷新数据

### 4. 加密功能
- 提供 AES 和 RSA 两种加密算法
- 支持自定义加密配置
- 包含加密和解密工具函数

## 开发要点

### 编码规范
- 使用 TypeScript 进行强类型编程
- 遵循 ESLint 规范
- 使用 Prettier 统一代码风格

### 核心技术
- 原生 JavaScript，无框架依赖
- 利用 vConsole 插件 API
- DOM 操作和事件处理
- 加密算法实现

### 关键实现细节
1. **面板定位策略**：
   - 优先使用 ID 查找
   - 备用 data-panel-id 查找
   - 最后遍历 `.vconsole-config-panel` 类名

2. **DOM 监听机制**：
   - 使用 MutationObserver 监听面板创建
   - 设置超时保护防止无限监听
   - 优化性能，避免不必要的重复监听

3. **加密实现**：
   - 支持多种加密算法
   - 提供便捷的加密配置接口
   - 包含错误处理和边界情况处理

## 扩展建议

### 功能增强方向
1. 添加更多加密算法支持
2. 增加配置项验证功能
3. 实现配置项搜索和过滤
4. 提供数据导出功能
5. 增加配置项编辑能力

### 性能优化点
1. 优化 DOM 查询效率
2. 减少不必要的重绘和回流
3. 实现虚拟滚动处理大量配置项
4. 优化加密解密算法性能

## 测试策略

项目使用 Vitest 进行单元测试，包含 UI 测试和功能测试。
- 使用 Testing Library 进行 DOM 操作测试
- 使用 Puppeteer 进行端到端测试
- 实现代码覆盖率检测

## 构建与发布

构建使用 Vite，支持多格式输出：
- ES Module (`dist/index.esm.js`)
- CommonJS (`dist/index.cjs.js`)
- UMD (`dist/index.js`)
- 类型定义文件 (`dist/index.d.ts`)

## UI自动化测试流程

UI自动化测试流程如下：
1. 使用 Vite 启动本地示例服务器
2. UI测试工具访问 Vite 本地服务地址
3. 在 `/examples` 目录中使用 Vue 语法实现UI示例
4. Playwright 测试脚本与示例页面交互，验证各项功能

### 测试文件结构
```
tests/
└── ui/
    └── config-panel-ui.test.ts    # UI自动化测试用例
examples/
├── ui-test-demo.html             # 基础功能UI测试示例
└── encrypted-config-demo.html    # 加密功能UI测试示例
```

### 运行UI测试
```bash
# 启动示例服务器
npm run examples

# 在另一个终端运行UI测试
npx playwright test
```

## 常见问题处理

1. **面板无法初始化**：
   - 检查 panelId 是否正确生成
   - 确认 MutationObserver 是否正常工作
   - 验证面板元素是否正确渲染

2. **数据刷新不及时**：
   - 检查 useState 和 setState 是否正确实现
   - 验证 show 事件监听是否正常触发

3. **加密功能异常**：
   - 确认加密配置参数是否正确
   - 验证加密算法是否按预期工作

4. **UI测试失败**：
   - 确保已构建最新版本的插件 (`npm run build`)
   - 检查示例页面是否正确引入了插件
   - 验证测试选择器是否与实际DOM结构匹配