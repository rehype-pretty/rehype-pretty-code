const {createRemarkPlugin} = require('../dist/mdx-pretty-code.cjs');
const fs = require('fs');

const prettyCode = createRemarkPlugin({
  shikiOptions: {
    theme: JSON.parse(
      fs.readFileSync(require.resolve('./assets/moonlight-ii.json'), 'utf-8')
    ),
  },
  onVisitLine(node) {
    // in `display: grid` mode, ensure the line not collapse in height and
    // copy/pasting will preserve newlines
    if (!node.textContent) {
      node.textContent = ' ';
    }
  },
  onVisitHighlightedLine(node) {
    node.className += ' line--highlighted';
  },
  onVisitHighlightedWord(node) {
    node.className = 'word';
  },
});

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [prettyCode],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  experimental: {esmExternals: true},
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
});
