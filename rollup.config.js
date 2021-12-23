import {nodeResolve} from '@rollup/plugin-node-resolve';

const common = {
  input: './src/index.js',
  plugins: [nodeResolve()],
  external: ['jsdom', 'parse-numeric-range', 'shiki', 'sanitize-html'],
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
