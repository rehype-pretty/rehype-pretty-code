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
  entry: ['./src/**/*.ts'],
  treeshake: 'recommended',
  skipNodeModulesBundle: true,
});
