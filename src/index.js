import visit from 'unist-util-visit';
import {JSDOM} from 'jsdom';
import rangeParser from 'parse-numeric-range';
import shiki from 'shiki';
import sanitizeHtml from 'sanitize-html';

export function createRemarkPlugin(options) {
  return () => async (tree) => {
    const {
      sanitizeOptions = {
        allowedAttributes: {
          code: ['style'],
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

    const highlighter = await shiki.getHighlighter(shikiOptions);
    const loadedLanguages = highlighter.getLoadedLanguages();

    visit(tree, 'inlineCode', inlineCode);
    visit(tree, 'code', blockCode);

    function inlineCode() {
      const meta = node.value.match(/{:([a-zA-Z.-]+)}$/)?.[1];

      if (!meta) {
        return;
      }

      node.type = 'html';

      // It's a token, not a lang
      if (meta[0] === '.') {
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

    function blockCode() {
      const lang =
        ignoreUnknownLanguage && !loadedLanguages.includes(node.lang)
          ? null
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
            const textArr = node.innerHTML.split(word);

            node.innerHTML = [
              textArr[0],
              `<span data-mdx-pretty-code-word>${word}</span>`,
              textArr[1],
            ].join('');

            const wordNode = node.querySelector('[data-mdx-pretty-code-word]');

            wordNode.removeAttribute('data-mdx-pretty-code-word');

            onVisitHighlightedWord(wordNode);
          }
        }
      });

      node.value = sanitizeHtml(
        dom.window.document.body.innerHTML,
        sanitizeOptions
      );
    }
  };
}
