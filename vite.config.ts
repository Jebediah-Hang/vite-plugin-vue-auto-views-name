import { resolve } from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "index",
      fileName: "index"
    },
    rollupOptions: {
      external: ["@vue/compiler-sfc"],
      output: {
        globals: {
          "@vue/compiler-sfc": "@vue/compiler-sfc"
        }
      }
    }
  }
});
