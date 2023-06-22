import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

/** @type {import('rollup').RollupOptions} */
const common = {
  input: './src/index.ts',
  plugins: [
    commonjs(),
    nodeResolve({ extensions: ['.ts', '.js'] }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.js'],
    }),
  ],
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
