import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import packageJson from './package.json' with { type: 'json' };

export default defineConfig([
  {
    input: './src/index.ts',
    plugins: [
      commonjs(),
      nodeResolve({ extensions: ['.ts', '.js'] }),
      babel({ extensions: ['.ts', '.js'], babelHelpers: 'bundled' }),
    ],
    external: [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.peerDependencies),
    ],
    output: {
      exports: 'default',
      file: './dist/rehype-pretty-code.js',
      format: 'esm',
    },
  },
]);
