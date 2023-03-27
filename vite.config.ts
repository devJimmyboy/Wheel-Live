import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: '../../wheel-live',
    // rollupOptions: {
    //   input: {
    //     index: resolve(__dirname, './src/index.html'),
    //   },
    // },
  },
})
