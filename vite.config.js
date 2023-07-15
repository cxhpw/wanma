import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { visualizer } from "rollup-plugin-visualizer";
import nodeResolve from '@rollup/plugin-node-resolve';

const lifecycle = process.env.npm_lifecycle_event;

console.log(process.cwd());
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    vue(),
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : null,
  ],
  resolve: {
    extensions: [".vue", ".ts"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
  css: {
    modules: {},
  },
  optimizeDeps: {
  },
  build: {
    minify: false,
    commonjsOptions: {
    },
    rollupOptions: {
      plugins: [
        nodeResolve(),
      ],
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        chunkFileNames: 'static/js/[name].js',
        manualChunks: (id) => {
          if (id.includes("highlight.js/lib/languages/")) {
            // 将 highlight.js 语言包单独打包到一个文件夹
            const file = id.toString().split('highlight.js/lib/languages/')[1].split('.')[0].toString();
            return `languages/${file}`;
          }
          // if (id.includes("markdown-it")) {
          //   return "markdown-it"
          // }
        },
      },
    },
  },
});
