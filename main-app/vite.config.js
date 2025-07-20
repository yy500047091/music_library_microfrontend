import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mainApp',
      remotes: {
        // 👇 Replace with your Netlify URL after deploying
        musicLibrary: process.env.NODE_ENV === 'production' 
          ? 'https://your-music-library.netlify.app/assets/remoteEntry.js'
          : 'http://localhost:5174/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  // 👇 Netlify needs a base path if not at root
  base: process.env.NODE_ENV === 'production' ? 'https://your-main-app.netlify.app/' : '/',
})