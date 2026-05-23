import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

import { nitro } from "nitro/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nitro()], // nitro() must remain last
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
