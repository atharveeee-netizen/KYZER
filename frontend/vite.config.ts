import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets load seamlessly on GitHub Pages
  server: {
    port: 3000,
  }
});
