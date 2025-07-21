import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
  ],
   server: {
    host: '0.0.0.0',       // Слушать все интерфейсы
    port: 5173,            // Можно оставить дефолтный
    strictPort: true,      // Не переключаться на другой порт
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
})
