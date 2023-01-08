import {visit} from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';
import {getHighlighter as shikiHighlighter} from 'shiki';
import {unified} from 'unified';
import rehypeParse from 'rehype-parse';
import hashObj from 'hash-obj';
import wordHighlighter from './word-highlighter';
import {reverseString} from './word-highlighter/utils';

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

const globalHighlighterCache = new Map();

export default function rehypePrettyCode(options = {}) {
  const {
    theme,
    tokensMap = {},
    filterMetaString = (v) => v,
    onVisitLine = () => {},
    onVisitHighlightedLine = () => {},
    onVisitHighlightedWord = () => {},
    getHighlighter = shikiHighlighter,
  } = options;

  const optionsHash = hashObj(
    {
      theme,
      tokensMap,
      onVisitLine,
      onVisitHighlightedLine,
      onVisitHighlightedWord,
      getHighlighter,
    },
    {algorithm: 'sha1'}
  );
  let highlighterCache = globalHighlighterCache.get(optionsHash);
  if (!highlighterCache) {
    highlighterCache = new Map();
    globalHighlighterCache.set(optionsHash, highlighterCache);
  }
  const highlighters = new Map();
  const hastParser = unified().use(rehypeParse, {fragment: true});

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

  return async (tree) => {
    for (const [mode, loadHighlighter] of highlighterCache.entries()) {
      if (!highlighters.get(mode)) {
        highlighters.set(mode, await loadHighlighter);
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
        const strippedValue = value.replace(/{:[a-zA-Z.-]+}/, '');
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
              `<pre><code><span style="color:${color}">${strippedValue}</span></code></pre>`
            );
          } else {
            trees[mode] = hastParser.parse(
              highlighter.codeToHtml(strippedValue, meta)
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
        let meta = filterMetaString(
          node.children[0].data?.meta ??
            node.children[0].properties.metastring ??
            ''
        );

        const tiltleMatch = meta.match(/title="(.+)"/);
        const title = tiltleMatch?.[1] ?? null;
        meta = meta.replace(tiltleMatch?.[0] ?? '', '');

        const lineNumbers = meta
          ? rangeParser(meta.match(/{(.*)}/)?.[1] ?? '')
          : [];

        let words = [];
        let wordNumbers = [];
        const wordIdsMap = new Map();

        const wordMatches = meta
          ? [...meta.matchAll(/\/(.*?)\/(\S*)/g)]
          : undefined;
        if (Array.isArray(wordMatches)) {
          wordMatches.forEach((name, index) => {
            const word = wordMatches[index][1];
            const wordIdAndOrRange = wordMatches[index][2];
            words.push(word);

            const [range, id] = wordIdAndOrRange.split('#');

            if (range) {
              wordNumbers.push(rangeParser(range));
            }

            if (id) {
              wordIdsMap.set(word, id);
            }
          });
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

          const wordOptions = {
            wordNumbers,
            wordIdsMap,
            wordCounter: 0,
          };

          visit(tree, 'element', (node) => {
            if (
              node.tagName === 'code' &&
              /srebmuNeniLwohs(?!(.*)(\/))/.test(reverseString(meta))
            ) {
              node.properties['data-line-numbers'] = '';

              if (index === 0) {
                const lineNumbersStartAtMatch = reverseString(meta).match(
                  /(?:\}(\d+){)?srebmuNeniLwohs(?!(.*)(\/))/
                );
                if (lineNumbersStartAtMatch[1])
                  node.properties['style'] = `counter-set: line ${
                    reverseString(lineNumbersStartAtMatch[1]) - 1
                  };`;
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

              wordHighlighter(node, words, wordOptions, onVisitHighlightedWord);
            }
          });
        });

        toFragment({node, trees, lang, title});
      }
    });
  };
}
