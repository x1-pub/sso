import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'cjs' ? 'index.cjs' : `index.${format}.js`,
    },

    target: 'node18',
    outDir: 'dist',
    rollupOptions: {
      external: ['node:crypto'],
    },
  },
});
