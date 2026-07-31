// vite.config.ts - 主配置文件，根据命令行参数决定使用哪个配置
import { defineConfig, mergeConfig } from "vite";
import libConfig from "./vite.config.lib.ts";
import e2eConfig from "./vite.config.e2e.ts";

// 根据环境变量或命令行参数选择配置
const mode =
  process.env.VITE_BUILD_MODE ||
  (process.argv.includes("--mode=e2e") ? "e2e" : "lib");

export default defineConfig(() => {
  if (mode === "lib") {
    return mergeConfig(libConfig, {
      // 特定于库的额外配置
    });
  } else {
    return mergeConfig(e2eConfig, {
      // 特定于E2E测试的额外配置
    });
  }
});
