import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@donegraph/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@donegraph/core/": path.resolve(__dirname, "packages/core/src/")
    }
  }
});
