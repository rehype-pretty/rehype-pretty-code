import {visit} from 'unist-util-visit';
import {JSDOM} from 'jsdom';
import rangeParser from 'parse-numeric-range';
import shiki from 'shiki';
import sanitizeHtml from 'sanitize-html';

// To make sure we only have one highlighter per theme in a process
const highlighterCache = new Map();

function getThemesFromSettings(settings) {
  if (
    typeof settings.theme === 'string' ||
    settings.theme?.hasOwnProperty('tokenColors')
  ) {
    return {default: settings.theme};
  }

  return settings.theme;
}

function highlightersFromSettings(settings) {
  const themes = getThemesFromSettings(settings);

  return Promise.all(
    Object.keys(themes).map(async (key) => {
      const theme = themes[key];
      const highlighter = await shiki.getHighlighter({
        ...settings,
        theme,
      });
      highlighter.themeKey = key;
      return highlighter;
    })
  );
}

export function createRemarkPlugin(options = {}) {
  return () => async (tree) => {
    const {
      sanitizeOptions = {
        allowedAttributes: {
          code: ['style', 'data-language', 'data-theme'],
          span: [
            'data-color',
            'data-mdx-pretty-code',
            'data-theme',
            'style',
            'class',
          ],
        },
      },
      shikiOptions = {},
      tokensMap = {},
      onVisitLine = () => {},
      onVisitHighlightedLine = () => {},
      onVisitHighlightedWord = () => {},
      ignoreUnknownLanguage = true,
    } = options;

    if (!highlighterCache.has(shikiOptions)) {
      highlighterCache.set(
        shikiOptions,
        highlightersFromSettings(shikiOptions)
      );
    }

    const highlighters = await highlighterCache.get(shikiOptions);
    const themes = getThemesFromSettings(shikiOptions);

    function remarkVisitor(fn) {
      return (node) => {
        let results;
        const hasMultipleThemes = highlighters.length > 1;
        const output = highlighters.map((highlighter, i) => {
          const loadedLanguages = highlighter.getLoadedLanguages();

          const theme = themes[highlighter.themeKey];
          return fn(node, {
            highlighter,
            theme,
            loadedLanguages,
            hasMultipleThemes,
          });
        });

        // return in case of non-meta inline code
        if (output.some((o) => !o)) return;

        results = output.join('\n');

        if (hasMultipleThemes) {
          // If we don't do this the code blocks will be wrapped in <undefined>
          // You can set your mdx renderer to replace this span with a React.Fragment during runtime
          results = `<span data-mdx-pretty-code-fragment>${results}</span>`;
        }
        node.value = results;
      };
    }

    visit(tree, 'inlineCode', remarkVisitor(inlineCode));
    visit(tree, 'code', remarkVisitor(blockCode));

    function inlineCode(node, {highlighter, theme}) {
      const meta = node.value.match(/{:([a-zA-Z.-]+)}$/)?.[1];

      if (!meta) {
        return;
      }

      node.type = 'html';
      // It's a token, not a lang
      if (meta[0] === '.') {
        if (typeof theme === 'string') {
          throw new Error(
            'MDX Pretty Code: Must be using a JSON theme object to use tokens.'
          );
        }

        const color =
          theme.tokenColors.find(({scope}) =>
            scope?.includes(tokensMap[meta.slice(1)] ?? meta.slice(1))
          )?.settings.foreground ?? 'inherit';

        return sanitizeHtml(
          `<span data-mdx-pretty-code data-color="${color}" data-theme="${
            highlighter.themeKey
          }"><span>${node.value.replace(/{:[a-zA-Z.-]+}/, '')}</span></span>`,
          sanitizeOptions
        );
      }

      const highlighted = highlighter.codeToHtml(
        node.value.replace(/{:\w+}/, ''),
        meta
      );

      const dom = new JSDOM(highlighted);
      const pre = dom.window.document.querySelector('pre');

      return sanitizeHtml(
        `<span data-mdx-pretty-code data-theme="${highlighter.themeKey}">${pre.innerHTML}</span>`,
        sanitizeOptions
      );
    }

    function blockCode(node, {highlighter, loadedLanguages}) {
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

      const code = dom.window.document.querySelector('code');

      code.setAttribute('data-language', lang);
      code.setAttribute('data-theme', highlighter.themeKey);
      return sanitizeHtml(dom.window.document.body.innerHTML, sanitizeOptions);
    }
  };
}
