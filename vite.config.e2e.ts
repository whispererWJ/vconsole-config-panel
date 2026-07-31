// vite.config.e2e.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import { defineVuePomGeneratorConfig, vuePomGenerator } from "@immense/vue-pom-generator";

const pomConfig = defineVuePomGeneratorConfig({
  vuePluginOwnership: "external",
  vueOptions: {
    script: { defineModel: true, propsDestructure: true },
  },
  logging: { verbosity: "info" },
  injection: {
    attribute: "data-testid",
    viewsDir: "src/views",
    componentDirs: ["src/components"],
    layoutDirs: ["src/layouts"],
    existingIdBehavior: "preserve",
  },
});

export default defineConfig({
  plugins: [
    vue(),
    ...vuePomGenerator(pomConfig),
  ],
  build: {
    // E2E测试构建配置
    outDir: "examples",
    rollupOptions: {
      input: {
        // 定义多个入口点，每个E2E测试示例一个
        basic: resolve(__dirname, "index.html"),
      },
      output: {
        // 输出到对应的子目录中
        assetFileNames: (assetInfo) => {
          if (assetInfo?.name?.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        entryFileNames: '[name]/[name]-[hash].js',
        chunkFileNames: '[name]/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname),
    },
  },
  server: {
    port: 3000,
  },
});