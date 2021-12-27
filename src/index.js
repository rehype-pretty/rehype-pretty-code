import {visit} from 'unist-util-visit';
import {JSDOM} from 'jsdom';
import rangeParser from 'parse-numeric-range';
import shiki from 'shiki';
import sanitizeHtml from 'sanitize-html';

let highlighter = null;

export function createRemarkPlugin(options = {}) {
  return () => async (tree) => {
    const {
      sanitizeOptions = {
        allowedAttributes: {
          code: ['style', 'data-language'],
          span: ['data-color', 'data-mdx-pretty-code', 'style', 'class'],
        },
      },
      shikiOptions = {},
      tokensMap = {},
      onVisitLine = () => {},
      onVisitHighlightedLine = () => {},
      onVisitHighlightedWord = () => {},
      ignoreUnknownLanguage = true,
    } = options;

    if (!highlighter) {
      highlighter = await shiki.getHighlighter(shikiOptions);
    }

    const loadedLanguages = highlighter.getLoadedLanguages();

    visit(tree, 'inlineCode', inlineCode);
    visit(tree, 'code', blockCode);

    function inlineCode(node) {
      const meta = node.value.match(/{:([a-zA-Z.-]+)}$/)?.[1];

      if (!meta) {
        return;
      }

      node.type = 'html';

      // It's a token, not a lang
      if (meta[0] === '.') {
        if (typeof shikiOptions.theme === 'string') {
          throw new Error(
            'MDX Pretty Code: Must be using a JSON theme object to use tokens.'
          );
        }

        const color =
          shikiOptions.theme.tokenColors.find(({scope}) =>
            scope?.includes(tokensMap[meta.slice(1)] ?? meta.slice(1))
          )?.settings.foreground ?? 'inherit';

        node.value = sanitizeHtml(
          `<span data-mdx-pretty-code data-color="${color}"><span>${node.value.replace(
            /{:[a-zA-Z.-]+}/,
            ''
          )}</span></span>`,
          sanitizeOptions
        );

        return;
      }

      const highlighted = highlighter.codeToHtml(
        node.value.replace(/{:\w+}/, ''),
        meta
      );

      const dom = new JSDOM(highlighted);
      const pre = dom.window.document.querySelector('pre');

      node.value = sanitizeHtml(
        `<span data-mdx-pretty-code>${pre.innerHTML}</span>`,
        sanitizeOptions
      );
    }

    function blockCode(node) {
      const lang =
        ignoreUnknownLanguage && !loadedLanguages.includes(node.lang)
          ? 'text'
          : node.lang;

      node.type = 'html';

      const highlighted = highlighter.codeToHtml(node.value, lang);

      const lineNumbers = node.meta
        ? rangeParser(node.meta.match(/{(.*)}/)?.[1] ?? '')
        : [];
      const word = node.meta?.match(/\/(.*)\//)?.[1];
      const wordNumbers = node.meta
        ? rangeParser(node.meta.match(/\/.*\/([^\s]*)/)?.[1] ?? '')
        : [];

      let visitedWordsCount = 0;

      const dom = new JSDOM(highlighted);
      dom.window.document.body.querySelectorAll('.line').forEach((node, i) => {
        onVisitLine(node);

        if (lineNumbers.includes(i + 1)) {
          onVisitHighlightedLine(node);
        }

        if (word && node.innerHTML.includes(word)) {
          visitedWordsCount++;

          if (
            wordNumbers.length === 0 ||
            wordNumbers.includes(visitedWordsCount)
          ) {
            const splitByBreakChar = new RegExp(`\\b${word}\\b`);
            const adjacentText = node.innerHTML.split(splitByBreakChar);

            node.innerHTML = adjacentText
              .map(
                (txt, i) =>
                  `${txt}${
                    i !== adjacentText.length - 1
                      ? `<span data-mdx-pretty-code-word>${word}</span>`
                      : ''
                  }`
              )
              .join('');

            node
              .querySelectorAll('[data-mdx-pretty-code-word]')
              .forEach((wordNode) => {
                wordNode.removeAttribute('data-mdx-pretty-code-word');
                onVisitHighlightedWord(wordNode);
              });
          }
        }
      });

      dom.window.document
        .querySelector('code')
        .setAttribute('data-language', lang);

      node.value = sanitizeHtml(
        dom.window.document.body.innerHTML,
        sanitizeOptions
      );
    }
  };
}
