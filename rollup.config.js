import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const common = {
  input: './src/index.js',
  plugins: [commonjs(), nodeResolve()],
  external: ['parse-numeric-range', 'shiki' 'rehype-parse', 'unified'],
};

export default [
  {
    ...common,
    output: {
      file: './dist/mdx-pretty-code.js',
      format: 'esm',
    },
  },
  {
    ...common,
    output: {
      file: './dist/mdx-pretty-code.cjs',
      format: 'cjs',
    },
  },
];
