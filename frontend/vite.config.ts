import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/KYZER/', // Exact repository base path for GitHub Pages
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'deckgl-vendor': ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers', '@deck.gl/react', '@loaders.gl/core', '@loaders.gl/i3s'],
          'map-vendor': ['maplibre-gl', 'react-map-gl'],
          'ui-vendor': ['react', 'react-dom', 'lucide-react', 'recharts'],
        },
      },
    },
  },
});
