import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

/** @type {import('rollup').RollupOptions} */
const common = {
  input: './src/index.js',
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
  external: ['parse-numeric-range', 'shiki'],
};

export default defineConfig([
  {
    ...common,
    output: {
      exports: 'default',
      file: './dist/rehype-pretty-code.js',
      format: 'esm',
    },
  },
  {
    ...common,
    output: {
      exports: 'default',
      file: './dist/rehype-pretty-code.cjs',
      format: 'cjs',
    },
  },
]);
