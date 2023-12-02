import type { Element, ElementContent, Root } from 'hast';
import type { LineElement, Options, Theme } from '../';
import type { CharsHighlighterOptions } from './types';
import {
  Highlighter,
  CodeToHastOptions,
  CodeOptionsMultipleThemes,
} from 'shikiji';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';
import { getHighlighter as defaultGetHighlighter } from 'shikiji';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import hashObj from 'hash-obj';
import { charsHighlighter } from './chars/charsHighlighter';
import { reverseString } from './chars/utils';
import {
  isElement,
  isText,
  isJSONTheme,
  parseBlockMetaString,
  isBlockCode,
  getInlineCodeLang,
  isInlineCode,
  getThemeNames,
} from './utils';

interface ApplyProps {
  tree: Root;
  lang: string;
  title?: string | null;
  caption?: string | null;
  inline?: boolean;
  keepBackground?: boolean;
  grid?: boolean;
  lineNumbersMaxDigits?: number;
  theme: Theme | Record<string, Theme>;
  onVisitTitle?: (element: Element) => void;
  onVisitCaption?: (element: Element) => void;
}

function apply(
  element: Element,
  {
    tree,
    lang,
    title,
    caption,
    inline = false,
    keepBackground = true,
    grid = true,
    lineNumbersMaxDigits = 1,
    theme,
    onVisitTitle,
    onVisitCaption,
  }: ApplyProps,
) {
  element.tagName = inline ? 'span' : 'figure';
  // User can replace this with a real Fragment at runtime
  element.properties = { 'data-rehype-pretty-code-figure': '' };
  element.children = [tree]
    .map((tree) => {
      const pre = tree.children[0];
      const themeNames = getThemeNames(theme);
      const themeNamesString = themeNames.join(' ');

      if (!isElement(pre) || !pre.properties) {
        return [];
      }

      const code = pre.children[0];

      // Remove class="shiki"
      if (
        Array.isArray(pre.properties?.className) &&
        pre.properties?.className.includes('shiki')
      ) {
        const className = pre.properties.className.filter(
          (c) =>
            c !== 'shiki' &&
            c !== 'shiki-themes' &&
            (typeof c === 'string' ? !themeNames.includes(c) : true),
        );
        pre.properties.className = className.length > 0 ? className : undefined;
      }

      if (!keepBackground) {
        pre.properties.style = undefined;
      }

      pre.properties['data-language'] = lang;
      pre.properties['data-theme'] = themeNamesString;

      if (!isElement(code) || !code.properties) {
        return [];
      }

      code.properties['data-language'] = lang;
      code.properties['data-theme'] = themeNamesString;

      if (inline) {
        if (keepBackground) {
          code.properties.style = pre.properties.style;
        }
        return code;
      }

      if (grid) {
        if (code.properties.style) {
          code.properties.style += 'display: grid;';
        } else {
          code.properties.style = 'display: grid;';
        }
      }

      if ('data-line-numbers' in code.properties) {
        code.properties['data-line-numbers-max-digits'] =
          lineNumbersMaxDigits.toString().length;
      }

      const fragments: ElementContent[] = [];

      if (title) {
        const elementContent: Element = {
          type: 'element',
          tagName: caption ? 'div' : 'figcaption',
          properties: {
            'data-rehype-pretty-code-title': '',
            'data-language': lang,
            'data-theme': themeNamesString,
          },
          children: [{ type: 'text', value: title }],
        };
        onVisitTitle?.(elementContent);
        fragments.push(elementContent);
      }

      fragments.push(pre);

      if (caption) {
        const elementContent: Element = {
          type: 'element',
          tagName: 'figcaption',
          properties: {
            'data-rehype-pretty-code-caption': '',
            'data-language': lang,
            'data-theme': themeNamesString,
          },
          children: [{ type: 'text', value: caption }],
        };
        onVisitCaption?.(elementContent);
        fragments.push(elementContent);
      }

      return fragments;
    })
    .flatMap((c) => c);
}

const globalHighlighterCache = new Map<string, Promise<Highlighter>>();
const hastParser = unified().use(rehypeParse, { fragment: true });

export default function rehypePrettyCode(
  options: Options = {},
): void | Transformer<Root, Root> {
  const {
    grid = true,
    theme = 'github-dark-dimmed',
    keepBackground = true,
    defaultLang = '',
    tokensMap = {},
    filterMetaString = (v) => v,
    getHighlighter = defaultGetHighlighter,
    onVisitLine,
    onVisitHighlightedLine,
    onVisitHighlightedChars,
    onVisitTitle,
    onVisitCaption,
  } = options;

  const optionsHash = hashObj(
    {
      theme,
      tokensMap,
      onVisitLine,
      onVisitHighlightedLine,
      onVisitHighlightedChars,
      getHighlighter,
    },
    { algorithm: 'sha1' },
  );
  let cachedHighlighter = globalHighlighterCache.get(optionsHash);
  if (!cachedHighlighter) {
    cachedHighlighter = getHighlighter({
      themes:
        isJSONTheme(theme) || typeof theme === 'string'
          ? [theme]
          : Object.values(theme),
      langs: ['plaintext'],
    });
    globalHighlighterCache.set(optionsHash, cachedHighlighter);
  }

  const defaultCodeBlockLang =
    typeof defaultLang === 'string' ? defaultLang : defaultLang.block || '';
  const defaultInlineCodeLang =
    typeof defaultLang === 'string' ? defaultLang : defaultLang.inline || '';

  function getOptions(lang: string): CodeToHastOptions<string, string> {
    const multipleThemes =
      !isJSONTheme(theme) && typeof theme === 'object' ? theme : null;
    const singleTheme = isJSONTheme(theme)
      ? theme
      : typeof theme === 'string'
        ? theme
        : null;

    return {
      lang,
      defaultColor: typeof theme === 'string' ? theme : false,
      ...((multipleThemes
        ? { themes: multipleThemes }
        : { theme: singleTheme }) as CodeOptionsMultipleThemes<string>),
    };
  }

  return async (tree) => {
    const langsToLoad = new Set<string>();

    const highlighter = await cachedHighlighter;

    if (!highlighter) return;

    visit(tree, 'element', (element, _, parent) => {
      if (isInlineCode(element, parent)) {
        const textElement = element.children[0];
        if (!isText(textElement)) return;
        const value = textElement.value;
        if (!value) return;

        const lang = getInlineCodeLang(value, defaultInlineCodeLang);

        if (lang[0] !== '.') {
          langsToLoad.add(lang);
        }
      }

      if (isBlockCode(element)) {
        const codeElement = element.children[0];
        if (!isElement(codeElement)) return;

        const { lang } = parseBlockMetaString(
          codeElement,
          filterMetaString,
          defaultCodeBlockLang,
        );

        langsToLoad.add(lang);
      }
    });

    // https://github.com/antfu/shikiji/issues/35
    const hasMd = langsToLoad.has('md') || langsToLoad.has('markdown');
    const langsWithoutMd = hasMd
      ? Array.from(langsToLoad).filter(
          (lang) => !['md', 'markdown'].includes(lang),
        )
      : Array.from(langsToLoad);
    await Promise.all(
      langsWithoutMd.map((lang) =>
        highlighter.loadLanguage(
          lang as Parameters<typeof highlighter.loadLanguage>[0],
        ),
      ),
    );
    if (hasMd) {
      await highlighter.loadLanguage('md');
    }

    visit(tree, 'element', (element, _, parent) => {
      if (isInlineCode(element, parent)) {
        const textElement = element.children[0];
        if (!isText(textElement)) return;

        const value = textElement.value;
        if (!value) return;

        // TODO: allow escape characters to break out of highlighting
        const strippedValue = value.replace(/{:[a-zA-Z.-]+}/, '');
        const lang = getInlineCodeLang(value, defaultInlineCodeLang);
        if (!lang) return;

        const isLang = lang[0] !== '.';

        let codeTree: Root;
        if (!isLang) {
          const themeNames = getThemeNames(theme);
          const isMultiTheme = typeof theme === 'object' && !isJSONTheme(theme);
          const themeKeys = isMultiTheme ? Object.keys(theme) : null;
          const colorsByTheme = themeNames.map((name) =>
            name
              ? highlighter
                  .getTheme(name)
                  .settings.find(
                    ({ scope }: { scope?: string[] }) =>
                      scope?.includes(
                        tokensMap[lang.slice(1)] ?? lang.slice(1),
                      ),
                  )?.settings.foreground ?? 'inherit'
              : 'inherit',
          );

          if (isMultiTheme && themeKeys) {
            codeTree = hastParser.parse(
              `<pre><code><span style="${themeKeys
                .map((key, i) => `--shiki-${key}:${colorsByTheme[i]}`)
                .join(';')}">${strippedValue}</span></code></pre>`,
            );
          } else {
            codeTree = hastParser.parse(
              `<pre><code><span style="color:${colorsByTheme[0]}">${strippedValue}</span></code></pre>`,
            );
          }
        } else {
          codeTree = hastParser.parse(
            highlighter.codeToHtml(strippedValue, getOptions(lang)),
          );
        }

        apply(element, {
          tree: codeTree,
          lang: isLang ? lang : '.token',
          inline: true,
          keepBackground,
          theme,
        });
      }

      if (isBlockCode(element)) {
        const codeElement = element.children[0] as Element;
        const textElement = codeElement.children[0];

        if (!isElement(codeElement)) return;

        const { title, caption, meta, lang } = parseBlockMetaString(
          codeElement,
          filterMetaString,
          defaultCodeBlockLang,
        );

        const lineNumbers = meta
          ? rangeParser(meta.match(/(?:^|\s){(.*?)}/)?.[1] ?? '')
          : [];
        let lineNumbersMaxDigits = 0;

        const words: string[] = [];
        const wordNumbers: Array<number[]> = [];
        const wordIdsMap = new Map();

        const wordMatches = meta
          ? [...meta.matchAll(/\/(.*?)\/(\S*)/g)]
          : undefined;
        if (Array.isArray(wordMatches)) {
          wordMatches.forEach((_, index) => {
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

        if (!isText(textElement)) {
          return;
        }

        const strippedValue = textElement.value.replace(/\n$/, '');
        let codeTree: Root;
        try {
          codeTree = hastParser.parse(
            highlighter.codeToHtml(strippedValue, getOptions(lang)),
          );
        } catch (e) {
          codeTree = hastParser.parse(
            highlighter.codeToHtml(strippedValue, getOptions('plaintext')),
          );
        }

        let lineCounter = 0;

        const wordOptions: CharsHighlighterOptions = {
          ranges: wordNumbers,
          idsMap: wordIdsMap,
          counterMap: new Map(),
        };

        visit(codeTree, 'element', (element) => {
          if (
            element.tagName === 'code' &&
            /srebmuNeniLwohs(?!(.*)(\/))/.test(reverseString(meta))
          ) {
            if (element.properties) {
              element.properties['data-line-numbers'] = '';
            }

            const lineNumbersStartAtMatch = reverseString(meta).match(
              /(?:\}(\d+){)?srebmuNeniLwohs(?!(.*)(\/))/,
            );
            const startNumberString = lineNumbersStartAtMatch?.[1];
            if (startNumberString) {
              const startAt = startNumberString
                ? Number(reverseString(startNumberString)) - 1
                : 0;
              lineNumbersMaxDigits = startAt;
              if (element.properties) {
                element.properties.style = `counter-set: line ${startAt};`;
              }
            }
          }

          if (
            Array.isArray(element.properties?.className) &&
            element.properties?.className?.[0] === 'line'
          ) {
            if (grid && element.children.length === 0) {
              element.children = [{ type: 'text', value: ' ' }];
            }

            const className = element.properties.className.filter(
              (c) => c !== 'line',
            );
            element.properties.className =
              className.length > 0 ? className : undefined;
            element.properties['data-line'] = '';
            onVisitLine?.(element as LineElement);

            if (
              lineNumbers.length !== 0 &&
              lineNumbers.includes(++lineCounter)
            ) {
              element.properties['data-highlighted-line'] = '';
              onVisitHighlightedLine?.(element as LineElement);
            }

            charsHighlighter(
              element,
              words,
              wordOptions,
              onVisitHighlightedChars,
            );

            lineNumbersMaxDigits++;
          }
        });

        apply(element, {
          tree: codeTree,
          lang,
          title,
          caption,
          keepBackground,
          grid,
          lineNumbersMaxDigits,
          theme,
          onVisitTitle,
          onVisitCaption,
        });
      }
    });
  };
}
