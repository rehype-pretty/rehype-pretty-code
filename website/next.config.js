const rehypePrettyCode = require('rehype-pretty-code');
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

/** @type {import('rehype-pretty-code').Options} */
const options = {
  keepBackground: false,
  theme: JSON.parse(
    fs.readFileSync(require.resolve('./assets/moonlight-ii.json'), 'utf-8')
  ),
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, options]],
  },
});

/** @type {import('next').NextConfig} */
module.exports = withMDX(nextConfig);
