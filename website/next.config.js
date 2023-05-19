const rehypePrettyCode = require('rehype-pretty-code');
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

/** @type {import('rehype-pretty-code').Options} */
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
  onVisitHighlightedWord(node, id) {
    node.properties.className = ['word'];

    if (id) {
      // If the word spans across syntax boundaries (e.g. punctuation), remove
      // colors from the child nodes.
      if (node.properties['data-rehype-pretty-code-wrapper']) {
        node.children.forEach((childNode) => {
          childNode.properties.style = '';
        });
      }

      node.properties.style = '';
      node.properties['data-word-id'] = id;
    }
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
module.exports = withMDX(nextConfig);
