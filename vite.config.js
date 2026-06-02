// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    // This tells Vite where to put the final files
    outDir: path.resolve(__dirname, './apps/shared/dist/'),
    rollupOptions: {
      // This is the CRITICAL part: point it to your JS file
      input: {
        "video-bundle": path.resolve(__dirname, './apps/shared/public/js/video-bundle.js'),
        "nunjucks-bundle": path.resolve(__dirname, './apps/shared/public/js/nunjucks-bundle.js'),
      },
      
      output: {
        // Keeps the filename as video-bundle.js instead of adding hashes
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});