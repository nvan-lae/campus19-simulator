import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ensure it listens on all interfaces for Docker
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './secrets/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './secrets/cert.pem')),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
