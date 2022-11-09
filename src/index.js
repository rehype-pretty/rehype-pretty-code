import {visit} from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';
import {getHighlighter as shikiHighlighter} from 'shiki';
import {unified} from 'unified';
import rehypeParse from 'rehype-parse';
import wordHighlighter from './wordHighlighter';

function toFragment({node, trees, lang, title, inline = false}) {
  node.tagName = inline ? 'span' : 'div';
  // User can replace this with a real Fragment at runtime
  node.properties = {'data-rehype-pretty-code-fragment': ''};
  node.children = Object.entries(trees)
    .map(([mode, tree]) => {
      const pre = tree.children[0];
      // Remove class="shiki" and the background-color
      pre.properties = {};
      pre.properties['data-language'] = lang;
      pre.properties['data-theme'] = mode;

      const code = pre.children[0];
      code.properties['data-language'] = lang;
      code.properties['data-theme'] = mode;

      if (inline) {
        return code;
      }

      if (title) {
        return [
          {
            type: 'element',
            tagName: 'div',
            properties: {
              'data-rehype-pretty-code-title': '',
              'data-language': lang,
              'data-theme': mode,
            },
            children: [{type: 'text', value: title}],
          },
          pre,
        ];
      }

      return pre;
    })
    .flatMap((c) => c);
}

export default function rehypePrettyCode(options = {}) {
  const {
    theme,
    tokensMap = {},
    onVisitLine = () => {},
    onVisitHighlightedLine = () => {},
    onVisitHighlightedWord = () => {},
    getHighlighter = shikiHighlighter,
  } = options;

  // Cache highlighters per unified processor
  const highlighterCache = new Map();
  const hastParser = unified().use(rehypeParse, {fragment: true});

  return async (tree) => {
    if (
      theme == null ||
      typeof theme === 'string' ||
      theme?.hasOwnProperty('tokenColors')
    ) {
      if (!highlighterCache.has('default')) {
        highlighterCache.set('default', getHighlighter({theme}));
      }
    } else if (typeof theme === 'object') {
      // color mode object
      for (const [mode, value] of Object.entries(theme)) {
        if (!highlighterCache.has(mode)) {
          highlighterCache.set(mode, getHighlighter({theme: value}));
        }
      }
    }

    const hastParser = unified().use(rehypeParse, {fragment: true});

    const highlighters = new Map();
    for (const [mode, loadHighlighter] of highlighterCache.entries()) {
      highlighters.set(mode, await loadHighlighter);
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
        for (const [mode, highlighter] of highlighters.entries()) {
          if (!isLang) {
            const color =
              highlighter
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
        const lang = node.children[0].properties.className[0].replace(
          'language-',
          ''
        );
        const meta =
          node.children[0].data?.meta ?? node.children[0].properties.metastring;
        const titleMatch = meta?.match(/title="(.+)"/);
        const title = titleMatch?.[1] ?? null;
        const titleString = titleMatch?.[0] ?? '';
        const metaWithoutTitle = meta?.replace(titleString, '');

        const lineNumbers = meta
          ? rangeParser(metaWithoutTitle.match(/{(.*)}/)?.[1] ?? '')
          : [];

        let word = [];
        const wordMatch = metaWithoutTitle
          ? [...metaWithoutTitle.matchAll(/\/(.*?)\//g)]
          : undefined;
        if (Array.isArray(wordMatch)) {
          wordMatch.forEach((name, index) => {
            word.push(wordMatch[index][1]);
          });
        }

        let wordNumbers = [];
        if (meta) {
          const wordNumbersMatch = metaWithoutTitle
            ? [...metaWithoutTitle.matchAll(/\/.*?\/(\S*)/g)]
            : undefined;
          if (Array.isArray(wordNumbersMatch)) {
            wordNumbersMatch.forEach((name, index) => {
              wordNumbers.push(rangeParser(wordNumbersMatch[index][1]));
            });
          }
        }

        const trees = {};
        for (const [mode, highlighter] of highlighters.entries()) {
          try {
            trees[mode] = hastParser.parse(
              highlighter.codeToHtml(codeNode.value.replace(/\n$/, ''), lang)
            );
          } catch (e) {
            // Fallback to plain text if a language has not been registered
            trees[mode] = hastParser.parse(
              highlighter.codeToHtml(codeNode.value.replace(/\n$/, ''), 'txt')
            );
          }
        }

        Object.entries(trees).forEach(([mode, tree], index) => {
          let lineCounter = 0;
          const wordOptions = {wordNumbers, wordCounter: 0};

          visit(tree, 'element', (node) => {
            if (
              node.tagName === 'code' &&
              /(?<!\/.*?)showLineNumbers/.test(meta)
            ) {
              node.properties['data-line-numbers'] = '';

              if (index === 0) {
                const lineNumbersStartAtMatch = meta.match(/(?<!\/.*?)showLineNumbers(?:\{(\d+)})?/);
                if (lineNumbersStartAtMatch[1])
                  node.properties['style'] = `counter-set: line ${lineNumbersStartAtMatch[1]};`;
              }
            }

            if (node.properties.className?.[0] === 'line') {
              onVisitLine(node);

              if (
                lineNumbers.length !== 0 &&
                lineNumbers.includes(++lineCounter)
              ) {
                onVisitHighlightedLine(node);
              }

              wordHighlighter(node, word, wordOptions, onVisitHighlightedWord);
            }
          });
        });

        toFragment({node, trees, lang, title});
      }
    });
  };
}
