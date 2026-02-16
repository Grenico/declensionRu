import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/declensionRu/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'element-plus': ['element-plus'],
          'element-icons': ['@element-plus/icons-vue'],
          'axios': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
