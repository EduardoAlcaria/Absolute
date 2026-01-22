import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,   // exposes on 0.0.0.0 so your phone can reach it via LAN IP
    proxy: {
      '/games':       'http://localhost:8000',
      '/game_img':    'http://localhost:8000',
      '/game_info':   'http://localhost:8000',
      '/users':       'http://localhost:8000',
      '/proxy':       'http://localhost:8000',
    },
  },
})