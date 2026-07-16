// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()], // 添加Vue插件以支持.vue文件
  build: {
    // 库构建配置
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VConsoleConfigPanel",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "index.esm.js";
        if (format === "cjs") return "index.cjs.js";
        if (format === "umd") return "index.js";
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["vconsole"],
      output: {
        globals: {
          vconsole: "VConsole",
        },
        exports: "named",
      },
    },
    sourcemap: true,
    minify: "esbuild",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "examples": resolve(__dirname, "examples"),
    },
  }
});
