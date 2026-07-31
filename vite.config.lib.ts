// vite.config.lib.ts
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
    // 库构建配置
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
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
      "@": resolve(__dirname),
    },
  }
});