import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
  // A propriedade base como './' é essencial para o Electron
  // encontrar os arquivos dentro do arquivo .asar
  base: './', 
  
  plugins: [
    vue(),
    vueDevTools(),
    electron({
      entry: 'electron/main.js',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})