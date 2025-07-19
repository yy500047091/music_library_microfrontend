import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mainApp',
      remotes: {
        musicLibrary: 'http://localhost:4173/assets/remoteEntry.js',
        // For local development, use: 'http://localhost:5174/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})