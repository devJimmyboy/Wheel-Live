import { defineConfig } from 'vite'
import { resolve } from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: '../../wheel-live',
    rollupOptions: {
      input: {
        index: resolve(__dirname, './index.html'),
        overlay: resolve(__dirname, './overlay/index.html'),
      },
    },
  },
})
