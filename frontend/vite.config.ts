import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/KYZER/', // Exact repository base path for GitHub Pages
  server: {
    port: 3000,
  }
});
