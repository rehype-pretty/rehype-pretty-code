import {visit} from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';
import shiki from 'shiki';
import {unified} from 'unified';
import rehypeParse from 'rehype-parse';

// Store only one highlighter per theme in a process
const highlighterCache = new Map();
const hastParser = unified().use(rehypeParse, {fragment: true});

function toFragment({node, trees, lang, inline = false}) {
  node.tagName = 'span';
  // User can replace this with a real Fragment at runtime
  node.properties = {'data-rehype-pretty-code-fragment': ''};
  node.children = Object.entries(trees).map(([mode, tree]) => {
    const pre = tree.children[0];
    // Remove class="shiki" and the background-color
    pre.properties = {};

    const code = pre.children[0];
    code.properties['data-language'] = lang;
    code.properties['data-theme'] = mode;

    if (inline) {
      return code;
    }

    return pre;
  });
}

export default function rehypePrettyCode(options = {}) {
  const {
    theme,
    tokensMap = {},
    onVisitLine = () => {},
    onVisitHighlightedLine = () => {},
    onVisitHighlightedWord = () => {},
  } = options;

  return async (tree) => {
    if (
      theme == null ||
      typeof theme === 'string' ||
      theme?.hasOwnProperty('tokenColors')
    ) {
      if (!highlighterCache.has('default')) {
        highlighterCache.set('default', await shiki.getHighlighter({theme}));
      }
    } else if (typeof theme === 'object') {
      // color mode object
      for (const [mode, value] of Object.entries(theme)) {
        if (!highlighterCache.has(mode)) {
          highlighterCache.set(
            mode,
            await shiki.getHighlighter({theme: value})
          );
        }
      }
    }

    visit(tree, 'element', (node, index, parent) => {
      // Inline code
      if (
        (node.tagName === 'code' && parent.tagName !== 'pre') ||
        node.tagName === 'inlineCode'
      ) {
        const value = node.children[0].value;

        if (!value) {
          return;
        }

        // TODO: allow escape characters to break out of highlighting
        const stippedValue = value.replace(/{:[a-zA-Z.-]+}/, '');
        const meta = value.match(/{:([a-zA-Z.-]+)}$/)?.[1];

        if (!meta) {
          return;
        }

        const isLang = meta[0] !== '.';

        const trees = {};
        for (const [mode, highlighter] of highlighterCache.entries()) {
          if (!isLang) {
            const color =
              highlighterCache
                .get(mode)
                .getTheme()
                .settings.find(({scope}) =>
                  scope?.includes(tokensMap[meta.slice(1)] ?? meta.slice(1))
                )?.settings.foreground ?? 'inherit';

            trees[mode] = hastParser.parse(
              `<pre><code><span style="color:${color}">${stippedValue}</span></code></pre>`
            );
          } else {
            trees[mode] = hastParser.parse(
              highlighter.codeToHtml(stippedValue, meta)
            );
          }
        }

        toFragment({node, trees, lang: isLang ? meta : '.token', inline: true});
      }

      if (
        // Block code
        // Check from https://github.com/leafac/rehype-shiki
        node.tagName === 'pre' &&
        Array.isArray(node.children) &&
        node.children.length === 1 &&
        node.children[0].tagName === 'code' &&
        typeof node.children[0].properties === 'object' &&
        Array.isArray(node.children[0].properties.className) &&
        typeof node.children[0].properties.className[0] === 'string' &&
        node.children[0].properties.className[0].startsWith('language-')
      ) {
        const codeNode = node.children[0].children[0];
        const lang = node.children[0].properties.className[0].split('-')[1];
        const meta =
          node.children[0].data?.meta ?? node.children[0].properties.metastring;
        const lineNumbers = meta
          ? rangeParser(meta.match(/{(.*)}/)?.[1] ?? '')
          : [];
        const word = meta?.match(/\/(.*)\//)?.[1];
        const wordNumbers = meta
          ? rangeParser(meta.match(/\/.*\/([^\s]*)/)?.[1] ?? '')
          : [];

        const trees = {};
        for (const [mode, highlighter] of highlighterCache.entries()) {
          trees[mode] = hastParser.parse(
            highlighter.codeToHtml(codeNode.value.replace(/\n$/, ''), lang)
          );
        }

        Object.entries(trees).forEach(([mode, tree]) => {
          let lineCounter = 0;
          let wordCounter = 0;

          visit(tree, 'element', (node) => {
            if (node.properties.className?.[0] === 'line') {
              onVisitLine(node);

              if (
                lineNumbers.length !== 0 &&
                lineNumbers.includes(++lineCounter)
              ) {
                onVisitHighlightedLine(node);
              }

              // TODO: handle words that span across syntax boundaries/nodes.
              // https://github.com/atomiks/mdx-pretty-code/issues/3
              node.children.forEach((child) => {
                if (child.children?.[0]?.value.includes(word)) {
                  if (
                    wordNumbers.length === 0 ||
                    wordNumbers.includes(++wordCounter)
                  ) {
                    onVisitHighlightedWord(child);
                  }
                }
              });
            }
          });
        });

        toFragment({node, trees, lang});
      }
    });
  };
}
