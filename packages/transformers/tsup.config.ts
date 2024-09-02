import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  shims: true,
  clean: true,
  bundle: true,
  outDir: 'dist',
  format: ['esm'],
  splitting: true,
  target: ['esnext'],
  sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  entry: {
    index: './src/index.ts',
    'copy-button': './src/copy-button.ts',
    'line-numbers': './src/line-numbers.ts',
    'foldable-lines': './src/foldable-lines.ts',
  },
  treeshake: 'recommended',
  skipNodeModulesBundle: true,
});
