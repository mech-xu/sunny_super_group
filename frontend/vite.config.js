import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.2.71:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 也可以直接代理所有以 /rest/ 开头的请求
      '/rest': {
        target: 'http://192.168.2.71:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rest/, '')
      }
    }
  },
  // 添加CSP兼容性配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }
})