import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy /api/anthropic/* → https://api.anthropic.com/*
      // Bypasses browser CORS restrictions on direct Anthropic API calls.
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api\/anthropic/, ''),
        configure: (proxy) => {
          // Ensure request headers (including x-api-key) are forwarded as-is.
          proxy.on('proxyReq', (proxyReq, req) => {
            // Copy every header from the original request onto the proxy request.
            const headers = req.headers;
            Object.keys(headers).forEach((key) => {
              const val = headers[key];
              if (val !== undefined) {
                proxyReq.setHeader(key, val);
              }
            });
          });
        },
      },
    },
  },
})
