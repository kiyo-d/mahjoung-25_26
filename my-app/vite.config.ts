import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@dist": path.resolve(__dirname, "../dist"), 

    },
  },
  server: {
      fs: {
        allow: [".."], // ← 一つ上の階層を読み込み許可
      },
  }
})
