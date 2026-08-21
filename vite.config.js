import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), nitro()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})