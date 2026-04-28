import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/demos/policy-prism/',
  plugins: [react()],
  build: {
    outDir: '../../public/demos/policy-prism',
    emptyOutDir: true,
    rollupOptions: {
      input: { app: resolve(__dirname, 'demo.html') },
    },
  },
});
