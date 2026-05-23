import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import nitro from 'nitro/vite'

export default defineConfig({
  plugins: [
    react(),
    nitro(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})