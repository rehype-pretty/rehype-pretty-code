import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import packageJson from './package.json';

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
  external: [
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.peerDependencies),
  ],
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
]);
