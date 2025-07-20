import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'musicLibrary',
      filename: 'remoteEntry.js',
      exposes: {
        './MusicLibrary': './src/MusicLibrary.jsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false, // Helps avoid loading issues
  },
  server: {
    port: 5174,
    cors: true,
  },
  // 👇 Netlify needs a base path if not at root
  base: process.env.NODE_ENV === 'production' ? 'https://your-music-library.netlify.app/' : '/',
})