import { defineConfig } from'vite'
import react from'@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When using a same-origin API base (e.g. import.meta.env.VITE_API_BASE ='/api/v1'), requests go to the local backend.
'/api': {
        target:'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
