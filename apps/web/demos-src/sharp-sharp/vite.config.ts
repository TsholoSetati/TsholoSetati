import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/demos/sharp-sharp/',
  appType: 'mpa',
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'sw.js',
      manifestFilename: 'manifest.webmanifest',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sharp-Sharp',
        short_name: 'Sharp-Sharp',
        description: 'Shared expense tracker — split, settle, ship.',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/demos/sharp-sharp/',
        start_url: '/demos/sharp-sharp/demo.html',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,webmanifest}'],
        navigateFallback: '/demos/sharp-sharp/demo.html',
        navigateFallbackDenylist: [/^\/demos\/(?!sharp-sharp\/)/],
      },
    }),
  ],
  build: {
    outDir: '../../public/demos/sharp-sharp',
    emptyOutDir: true,
    rollupOptions: {
      input: { app: resolve(__dirname, 'demo.html') },
      output: { manualChunks: undefined },
    },
  },
});
