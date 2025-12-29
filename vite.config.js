import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: resolve(__dirname, 'src/main/main.js'),
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron', 'sharp', 'fs', 'path', 'fs/promises'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/main/preload.js'),
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist-electron'),
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs', // Force CommonJS format for preload script
                entryFileNames: '[name].cjs', // Output as .cjs instead of .js
              },
              plugins: [
                {
                  name: 'fix-preload-export',
                  generateBundle(options, bundle) {
                    // Find the preload.cjs file and remove the export statement
                    for (const fileName in bundle) {
                      if (fileName === 'preload.cjs') {
                        const chunk = bundle[fileName];
                        if (chunk.type === 'chunk') {
                          // Replace 'export default' with immediate execution
                          chunk.code = chunk.code.replace(
                            /export default (require_preload\(\));?/,
                            '$1'
                          );
                        }
                      }
                    }
                  },
                },
              ],
            },
          },
        },
      },
    ]),
  ],
  root: resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
