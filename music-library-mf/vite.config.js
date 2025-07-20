import { defineConfig } from 'vite';  // Add this line at the very top
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'musicLibrary',
      filename: 'remoteEntry.js',
      exposes: {
        './MusicLibrary': './src/MusicLibrary.jsx'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5174,
    cors: true
  }
})