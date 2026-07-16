import { defineConfig } from "vite";
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()], // 添加Vue插件以支持.vue文件
  build: {
    outDir: resolve(__dirname, "examples_dist"), // 输出到特殊目录
    emptyOutDir: true, // 构建前清空目录
    rollupOptions: {
      input: {
        main: resolve(__dirname, "examples/main.ts"), // 示例入口
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "examples": resolve(__dirname, "examples"),
    },
  },
  cacheDir: resolve(__dirname, "node_modules/.viteCache"),
  server: {
    open: true,
    port: 6008,
  },
});