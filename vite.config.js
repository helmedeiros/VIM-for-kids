/* eslint-env node */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Split domain logic into separate chunk
          domain: [
            './src/domain/entities/Cursor.js',
            './src/domain/entities/VimKey.js',
            './src/domain/entities/GameMap.js',
            './src/domain/value-objects/Position.js',
            './src/domain/value-objects/TileType.js',
          ],
          // Split application logic into separate chunk
          application: [
            './src/application/GameState.js',
            './src/application/use-cases/MovePlayerUseCase.js',
          ],
          // Split infrastructure into separate chunk
          infrastructure: [
            './src/infrastructure/ui/DOMGameRenderer.js',
            './src/infrastructure/input/KeyboardInputHandler.js',
          ],
        },
      },
    },
    target: 'es2020',
  },

  // Development optimizations
  optimizeDeps: {
    include: [],
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Plugin configuration
  plugins: [],

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
