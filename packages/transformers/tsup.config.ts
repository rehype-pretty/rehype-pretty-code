import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  shims: true,
  clean: true,
  bundle: true,
  outDir: 'dist',
  format: ['esm'],
  splitting: true,
  sourcemap: true,
  target: ['esnext'],
  entry: {
    index: './src/index.ts',
    'copy-button': './src/copy-button.ts',
    'foldable-sections': './src/foldable-sections.ts',
  },
  treeshake: 'recommended',
  skipNodeModulesBundle: true,
});
