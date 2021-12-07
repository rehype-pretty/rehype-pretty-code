const common = {
  input: './src/index.js',
  external: [
    'jsdom',
    'parse-numeric-range',
    'shiki',
    'sanitize-html',
    'unist-util-visit',
  ],
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
