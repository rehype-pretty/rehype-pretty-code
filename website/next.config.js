const rehypePrettyCode = require('rehype-pretty-code');
const fs = require('fs');

const options = {
  theme: JSON.parse(
    fs.readFileSync(require.resolve('./assets/moonlight-ii.json'), 'utf-8')
  ),
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode, and allow empty
    // lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{type: 'text', value: ' '}];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push('line--highlighted');
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['word'];
  },
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, options]],
  },
});

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  experimental: {esmExternals: true},
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
});
