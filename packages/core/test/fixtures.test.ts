import {
  lstatSync,
  readdirSync,
  readFileSync,
  type PathOrFileDescriptor,
} from 'node:fs';
import type { Element } from 'hast';
import {
  type BundledTheme,
  type BundledLanguage,
  type HighlighterGeneric,
  type BundledHighlighterOptions,
  getSingletonHighlighter as shikiHighlighter,
} from 'shiki';
import prettier from 'prettier';
import { remark } from 'remark';
import { join, parse } from 'node:path';
import type { Compatible } from 'vfile';
import { toHtml } from 'hast-util-to-html';
import { toString as hastToString } from 'hast-util-to-string';
import { toHast } from 'mdast-util-to-hast';
import rehypeParse from 'rehype-parse';
import rehypePrettyCode, { type Options } from '../src';
import { charsHighlighter } from '../src/chars/charsHighlighter';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { expect, describe, it, vi, type Mock } from 'vitest';
import { transformerNotationDiff } from '@shikijs/transformers';

const resultsFolder = join(import.meta.dirname, 'results');
const fixturesFolder = join(import.meta.dirname, 'fixtures');

const getHtml = async (
  code: Compatible | undefined,
  options: Options | undefined,
) => {
  const hAst = toHast(remark().parse(code), { allowDangerousHtml: true });
  // @ts-expect-error
  await rehypePrettyCode(options)(hAst);
  return toHtml(hAst, { allowDangerousHtml: true });
};

const inspectHighlightedHtml = (html: string) => {
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const highlightedChars: Array<{ text: string; id: unknown }> = [];
  let codeText: string | undefined;

  visit(tree, 'element', (element) => {
    if (element.tagName === 'code') {
      codeText = hastToString(element);
    }

    if (Object.hasOwn(element.properties, 'dataHighlightedChars')) {
      highlightedChars.push({
        text: hastToString(element),
        id: element.properties.dataCharsId,
      });
    }
  });

  return { codeText, highlightedChars };
};

const parseQueryParameters = (query: string) =>
  Object.fromEntries(new URLSearchParams(query).entries());

const getTheme = (multiple: boolean): Options['theme'] => {
  return multiple
    ? { dark: 'github-dark', light: 'github-light' }
    : 'github-dark';
};

const isMultipleThemeTest = (fixtureName: string) => {
  return fixtureName.toLowerCase().includes('multipletheme');
};

// To add a test, create a markdown file in the fixtures folder
const runFixture = async (
  fixture: PathOrFileDescriptor,
  fixtureName: string,
  getHighlighter: Mock<
    [
      options?:
        | BundledHighlighterOptions<BundledLanguage, BundledTheme>
        | undefined,
    ],
    Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
  >,
) => {
  const testName = parse(fixtureName).name;
  const resultHtmlName = `${testName}.html`;
  const resultHtmlPath = join(resultsFolder, resultHtmlName);

  const code = readFileSync(fixture, 'utf8');

  const html = await getHtml(code, {
    keepBackground: !resultHtmlName.includes('keepBackground'),
    defaultLang: (() => {
      if (testName === 'no-highlighting') {
        return undefined;
      }

      const [, lang] = testName.split('.');
      if (!lang) {
        return undefined;
      }
      if (lang === 'js') {
        return 'js';
      }
      return parseQueryParameters(lang);
    })(),
    filterMetaString: (string) => string?.replace(/filename=".*"/, ''),
    theme: getTheme(isMultipleThemeTest(testName)),
    onVisitHighlightedLine(node) {
      node.properties.className = ['highlighted'];
    },
    onVisitHighlightedChars(node, id) {
      node.properties.className = ['word'];

      if (id) {
        const textColor: Record<string, string> = {
          a: 'pink',
          b: 'cyan',
          c: 'lightblue',
          id: 'white',
        };
        const backgroundColor: Record<string, string> = {
          a: 'rgba(255, 100, 200, 0.35)',
          b: 'rgba(0, 255, 100, 0.25)',
          c: 'rgba(100, 200, 255, 0.25)',
          id: 'rgba(255, 255, 255, 0.25)',
        };
        node.properties.style = `
          color: ${textColor[id]}; 
          background-color: ${backgroundColor[id]}
        `;
      }
    },
    onVisitLine(_node) {
      _node;
    },
    onVisitTitle(node) {
      node.properties.style = 'font-weight: bold;';
    },
    onVisitCaption(node) {
      node.properties.style = 'color: red;';
    },
    getHighlighter,
    transformers: [transformerNotationDiff()],
  });

  const htmlString = await prettier.format(html, { parser: 'html' });
  return { htmlString, resultHtmlPath };
};

describe('Single theme', () => {
  const getHighlighter = vi.fn(shikiHighlighter);

  readdirSync(fixturesFolder).forEach((fixtureName) => {
    if (isMultipleThemeTest(fixtureName)) return;

    const fixture = join(fixturesFolder, fixtureName);
    if (lstatSync(fixture).isDirectory()) {
      return;
    }

    it(`Fixture: ${fixtureName}`, async () => {
      const { htmlString, resultHtmlPath } = await runFixture(
        fixture,
        fixtureName,
        // @ts-expect-error
        getHighlighter,
      );

      expect(defaultStyle + htmlString).toMatchFileSnapshot(resultHtmlPath);
    });
  });
});

describe('Multiple theme', () => {
  const getHighlighter = vi.fn(shikiHighlighter);

  readdirSync(fixturesFolder).forEach((fixtureName) => {
    if (!isMultipleThemeTest(fixtureName)) return;

    const fixture = join(fixturesFolder, fixtureName);
    if (lstatSync(fixture).isDirectory()) {
      return;
    }

    it(`Fixture: ${fixtureName}`, async () => {
      const { htmlString, resultHtmlPath } = await runFixture(
        fixture,
        fixtureName,
        // @ts-expect-error
        getHighlighter,
      );

      expect(defaultStyle + htmlString).toMatchFileSnapshot(resultHtmlPath);
    });
  });
});

it("highlighter caches don't overwrite each other", async () => {
  const [html1, html2] = await Promise.all([
    getHtml('`[1, 2, 3]{:js}`', { theme: 'github-light' }),
    getHtml('`[1, 2, 3]{:js}`', { theme: 'github-dark' }),
  ]);
  // both highlighters are being cached under the same key, but in separate caches,
  // that's what we're testing here by asserting that they yield different results
  expect(html1).not.toBe(html2);
});

it('highlights repeated chars spanning syntax tokens without changing the source', async () => {
  const source = 's = "\\aa"';
  const html = await getHtml(['```python /aa/', source, '```'].join('\n'), {
    theme: 'github-dark',
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const highlightedChars: Array<string> = [];
  let codeText: string | undefined;

  visit(tree, 'element', (element) => {
    if (element.tagName === 'code') {
      codeText = hastToString(element);
    }

    if (Object.hasOwn(element.properties, 'dataHighlightedChars')) {
      highlightedChars.push(hastToString(element));
    }
  });

  expect(codeText).toBe(source);
  expect(highlightedChars).toEqual(['aa']);
});

it('counts complete repeated-char matches across syntax tokens', async () => {
  const source = 's = "\\aaaa"';
  const html = await getHtml(['```python /aa/2', source, '```'].join('\n'), {
    theme: 'github-dark',
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const highlightedChars: Array<{ text: string; nextText: string }> = [];
  let codeText: string | undefined;

  visit(tree, 'element', (element, index, parent) => {
    if (element.tagName === 'code') {
      codeText = hastToString(element);
    }

    if (
      Object.hasOwn(element.properties, 'dataHighlightedChars') &&
      typeof index === 'number' &&
      parent
    ) {
      const nextSibling = parent.children[index + 1];
      highlightedChars.push({
        text: hastToString(element),
        nextText: nextSibling ? hastToString(nextSibling) : '',
      });
    }
  });

  expect(codeText).toBe(source);
  expect(highlightedChars).toEqual([{ text: 'aa', nextText: '"' }]);
});

it('preserves mixed token children when highlighting the whole token', async () => {
  const source = 'const value = 1;';
  const highlightedChars: Array<{ text: string; id: string | undefined }> = [];
  const html = await getHtml(['```js /const/', source, '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'split-token-children',
        span(element) {
          if (hastToString(element) === 'const') {
            element.children = [
              { type: 'text', value: 'c' },
              {
                type: 'element',
                tagName: 'em',
                properties: {},
                children: [{ type: 'text', value: 'onst' }],
              },
            ];
          }
        },
      },
    ],
    onVisitHighlightedChars(element, id) {
      highlightedChars.push({ text: hastToString(element), id });
    },
  });

  const output = inspectHighlightedHtml(html);

  expect(output.codeText).toBe(source);
  expect(output.highlightedChars).toEqual([{ text: 'const', id: undefined }]);
  expect(highlightedChars).toEqual([{ text: 'const', id: undefined }]);
  expect(html.match(/<em>onst<\/em>/g)).toHaveLength(1);
});

it('preserves auxiliary token children when highlighting a partial match', async () => {
  const source = 'foo';
  const html = await getHtml(['```js /oo/', source, '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'append-word-break',
        span(element) {
          if (hastToString(element) === source) {
            element.children.push({
              type: 'element',
              tagName: 'wbr',
              properties: {},
              children: [],
            });
          }
        },
      },
    ],
  });

  const output = inspectHighlightedHtml(html);

  expect(output.codeText).toBe(source);
  expect(output.highlightedChars).toEqual([{ text: 'oo', id: undefined }]);
  expect(html.match(/<wbr>/g)).toHaveLength(1);
});

it('counts nested partial matches when applying a range', async () => {
  const source = ['foobar;', 'foo;'].join('\n');
  const html = await getHtml(['```js /foo/2', source, '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'nest-first-line-tokens',
        span(element, line) {
          if (line === 1) {
            element.children = [
              {
                type: 'element',
                tagName: 'em',
                properties: {},
                children: element.children,
              },
            ];
          }
        },
      },
    ],
  });

  const output = inspectHighlightedHtml(html);

  expect(output.codeText).toBe(source);
  expect(output.highlightedChars).toEqual([{ text: 'foo', id: undefined }]);
});

it('highlights partial matches nested by a transformer', async () => {
  const source = 'foobar';
  const highlightedChars: Array<{ text: string; id: string | undefined }> = [];
  const html = await getHtml(
    ['```js /foo/#keyword', source, '```'].join('\n'),
    {
      theme: 'github-dark',
      transformers: [
        {
          name: 'nest-token-children',
          span(element) {
            if (hastToString(element) === source) {
              element.children = [
                {
                  type: 'element',
                  tagName: 'em',
                  properties: {},
                  children: element.children,
                },
              ];
            }
          },
        },
      ],
      onVisitHighlightedChars(element, id) {
        highlightedChars.push({ text: hastToString(element), id });
      },
    },
  );

  const output = inspectHighlightedHtml(html);

  expect(output.codeText).toBe(source);
  expect(output.highlightedChars).toEqual([{ text: 'foo', id: 'keyword' }]);
  expect(highlightedChars).toEqual([{ text: 'foo', id: 'keyword' }]);
  expect(html.match(/<em>/g)).toHaveLength(1);
  expect(html.match(/<\/em>/g)).toHaveLength(1);
});

it('preserves transformer-owned interactive elements around partial highlights', async () => {
  const source = 'foobar';
  const html = await getHtml(['```js /oob/', source, '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'link-token',
        span(element) {
          if (hastToString(element) === source) {
            element.children = [
              {
                type: 'element',
                tagName: 'a',
                properties: {
                  id: 'definition',
                  href: '#definition',
                  ariaLabel: 'Go to definition',
                },
                children: element.children,
              },
            ];
          }
        },
      },
    ],
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const links: Array<Element> = [];
  const highlightedChars: Array<string> = [];

  visit(tree, 'element', (element) => {
    if (element.tagName === 'a') {
      links.push(element);
    }

    if (Object.hasOwn(element.properties, 'dataHighlightedChars')) {
      highlightedChars.push(hastToString(element));
    }
  });

  expect(links).toHaveLength(1);
  expect(links[0]?.properties.id).toBe('definition');
  expect(hastToString(links[0])).toBe(source);
  expect(highlightedChars).toEqual(['oob']);
});

it('preserves a transformer-owned semantic element on a whole match', async () => {
  const html = await getHtml(['```js /foo/', 'foo', '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'link-token',
        span(element) {
          if (hastToString(element) === 'foo') {
            element.tagName = 'a';
            element.properties = {
              id: 'definition',
              href: '#definition',
              ariaLabel: 'Go to definition',
            };
          }
        },
      },
    ],
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const links: Array<Element> = [];

  visit(tree, 'element', (element) => {
    if (element.tagName === 'a') {
      links.push(element);
    }
  });

  expect(links).toHaveLength(1);
  expect(links[0]?.properties.id).toBe('definition');
  expect(hastToString(links[0])).toBe('foo');
  expect(inspectHighlightedHtml(html).highlightedChars).toEqual([
    { text: 'foo', id: undefined },
  ]);
});

it('preserves a whole transformer-owned first boundary in a cross-token match', async () => {
  const source = 'const value = 1;';
  const highlightedChars: Array<{ text: string; id: string | undefined }> = [];
  const html = await getHtml(
    ['```js /const val/#chars-a', source, '```'].join('\n'),
    {
      theme: 'github-dark',
      transformers: [
        {
          name: 'link-keyword',
          span(element) {
            if (hastToString(element) === 'const') {
              element.tagName = 'a';
              element.properties = {
                id: 'definition-start',
                href: '#definition-start',
              };
            }
          },
        },
      ],
      onVisitHighlightedChars(element, id) {
        highlightedChars.push({ text: hastToString(element), id });
      },
    },
  );
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const links: Array<Element> = [];

  visit(tree, 'element', (element) => {
    if (element.tagName === 'a') {
      links.push(element);
    }
  });

  expect(inspectHighlightedHtml(html).highlightedChars).toEqual([
    { text: 'const val', id: 'chars-a' },
  ]);
  expect(highlightedChars).toEqual([{ text: 'const val', id: 'chars-a' }]);
  expect(links).toHaveLength(1);
  expect(links[0]?.properties.id).toBe('definition-start');
  expect(hastToString(links[0])).toBe('const');
});

it('preserves a whole transformer-owned last boundary in a cross-token match', async () => {
  const source = 'foo.bar()';
  const highlightedChars: Array<{ text: string; id: string | undefined }> = [];
  const html = await getHtml(
    ['```js /o.bar/#chars-b', source, '```'].join('\n'),
    {
      theme: 'github-dark',
      transformers: [
        {
          name: 'link-property',
          span(element) {
            if (hastToString(element) === 'bar') {
              element.tagName = 'a';
              element.properties = {
                id: 'definition-end',
                href: '#definition-end',
              };
            }
          },
        },
      ],
      onVisitHighlightedChars(element, id) {
        highlightedChars.push({ text: hastToString(element), id });
      },
    },
  );
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const links: Array<Element> = [];

  visit(tree, 'element', (element) => {
    if (element.tagName === 'a') {
      links.push(element);
    }
  });

  expect(inspectHighlightedHtml(html).highlightedChars).toEqual([
    { text: 'o.bar', id: 'chars-b' },
  ]);
  expect(highlightedChars).toEqual([{ text: 'o.bar', id: 'chars-b' }]);
  expect(links).toHaveLength(1);
  expect(links[0]?.properties.id).toBe('definition-end');
  expect(hastToString(links[0])).toBe('bar');
});

it('retains decorated whole-token highlight properties and callback shape', async () => {
  const highlightedChars: Array<Element> = [];
  const html = await getHtml(['```js /foo/', 'foo', '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'decorate-token',
        span(element) {
          if (hastToString(element) === 'foo') {
            element.properties.className = ['token'];
          }
        },
      },
    ],
    onVisitHighlightedChars(element) {
      highlightedChars.push(element);
    },
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const markedTokens: Array<Element> = [];

  visit(tree, 'element', (element) => {
    if (Object.hasOwn(element.properties, 'dataHighlightedChars')) {
      markedTokens.push(element);
    }
  });

  expect(markedTokens).toHaveLength(1);
  expect(markedTokens[0]?.tagName).toBe('mark');
  expect(markedTokens[0]?.properties.className).toEqual(['token']);
  expect(highlightedChars).toHaveLength(1);
  expect(highlightedChars[0]?.tagName).toBe('mark');
  expect(highlightedChars[0]?.properties.className).toEqual(['token']);
});

it('isolates transformer properties from ranged highlight callbacks', async () => {
  const source = 'foofoo';
  const html = await getHtml(['```js /foo/2', source, '```'].join('\n'), {
    theme: 'github-dark',
    transformers: [
      {
        name: 'decorate-token',
        span(element) {
          if (hastToString(element) === source) {
            element.properties.id = 'token';
            element.properties.className = ['token'];
          }
        },
      },
    ],
    onVisitHighlightedChars(element) {
      const className = element.properties.className;
      if (Array.isArray(className)) {
        className.push('highlighted');
      }
    },
  });
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const tokenElements: Array<Element> = [];
  const untouchedTokens: Array<Element> = [];
  const highlightedElements: Array<Element> = [];

  visit(tree, 'element', (element) => {
    if (element.properties.id === 'token') {
      tokenElements.push(element);
    }

    if (
      !Object.hasOwn(element.properties, 'dataHighlightedChars') &&
      Array.isArray(element.properties.className) &&
      element.properties.className.includes('token')
    ) {
      untouchedTokens.push(element);
    }

    if (Object.hasOwn(element.properties, 'dataHighlightedChars')) {
      highlightedElements.push(element);
    }
  });

  expect(tokenElements).toHaveLength(1);
  expect(hastToString(tokenElements[0])).toBe('foo');
  expect(untouchedTokens).toHaveLength(1);
  expect(untouchedTokens[0]?.properties.className).toEqual(['token']);
  expect(highlightedElements).toHaveLength(1);
  expect(highlightedElements[0]?.properties.className).toEqual([
    'token',
    'highlighted',
  ]);
  expect(hastToString(highlightedElements[0])).toBe('foo');
});

it('does not duplicate transformer ids when splitting token boundaries', async () => {
  let tokenIndex = 0;
  const html = await getHtml(
    ['```js /onst x/', 'const xyz = 1', '```'].join('\n'),
    {
      theme: 'github-dark',
      transformers: [
        {
          name: 'identify-tokens',
          span(element) {
            element.properties.id = `token-${tokenIndex++}`;
          },
        },
      ],
    },
  );
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const ids: Array<string> = [];

  visit(tree, 'element', (element) => {
    if (typeof element.properties.id === 'string') {
      ids.push(element.properties.id);
    }
  });

  expect(inspectHighlightedHtml(html).highlightedChars).toEqual([
    { text: 'onst x', id: undefined },
  ]);
  expect(new Set(ids).size).toBe(ids.length);
});

it('composes adjacent matches across an identified token boundary', () => {
  const line: Element = {
    type: 'element',
    tagName: 'span',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { style: 'color:red' },
        children: [{ type: 'text', value: 'ab' }],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { id: 'token', style: 'color:blue' },
        children: [{ type: 'text', value: 'cd' }],
      },
    ],
  };
  const highlightedChars: Array<string> = [];

  charsHighlighter(
    line,
    ['abc', 'd'],
    {
      ranges: [[], []],
      idsMap: new Map(),
      counterMap: new Map(),
    },
    (element) => {
      highlightedChars.push(hastToString(element));
    },
  );

  expect(hastToString(line)).toBe('abcd');
  expect(highlightedChars).toEqual(['abc', 'd']);
});

it('does not materialize range-excluded occurrences', () => {
  const source = 'a'.repeat(101);
  const line: Element = {
    type: 'element',
    tagName: 'span',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { style: 'color:red' },
        children: [{ type: 'text', value: source }],
      },
    ],
  };
  const highlightedChars: Array<string> = [];

  charsHighlighter(
    line,
    ['a'],
    {
      ranges: [[100]],
      idsMap: new Map(),
      counterMap: new Map(),
    },
    (element) => {
      highlightedChars.push(hastToString(element));
    },
  );

  expect(hastToString(line)).toBe(source);
  expect(line.children).toHaveLength(3);
  expect(highlightedChars).toEqual(['a']);
});

it('does not count comments as highlighted text when splitting nested tokens', () => {
  const line: Element = {
    type: 'element',
    tagName: 'span',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: {},
        children: [
          { type: 'comment', value: 'foo' },
          { type: 'text', value: 'foobar' },
        ],
      },
    ],
  };
  const highlightedChars: Array<string> = [];

  charsHighlighter(
    line,
    ['foo'],
    {
      ranges: [[1]],
      idsMap: new Map(),
      counterMap: new Map(),
    },
    (element) => {
      highlightedChars.push(hastToString(element));
    },
  );

  expect(hastToString(line)).toBe('foobar');
  expect(highlightedChars).toEqual(['foo']);
});

it('composes token-spanning ranges, ids, and highlighted-char callbacks', async () => {
  const line = 's = "\\aa"';
  const source = [line, line].join('\n');
  const highlightedChars: Array<{ text: string; id: string | undefined }> = [];
  const html = await getHtml(['```python /aa/2#a', source, '```'].join('\n'), {
    theme: 'github-dark',
    onVisitHighlightedChars(element, id) {
      highlightedChars.push({ text: hastToString(element), id });
    },
  });

  const output = inspectHighlightedHtml(html);

  expect(output.codeText).toBe(source);
  expect(output.highlightedChars).toEqual([{ text: 'aa', id: 'a' }]);
  expect(highlightedChars).toEqual([{ text: 'aa', id: 'a' }]);
});

it('matches chars exactly regardless of syntax token boundaries', () => {
  const cases = [
    { parts: ['ba', 'bb'], chars: 'bb' },
    { parts: ['aa', 'ab'], chars: 'aab' },
    { parts: ['a', 'b', 'c', 'a', 'babcab'], chars: 'abcab' },
  ];

  const results = cases.map(({ parts, chars }) => {
    const source = parts.join('');
    const line: Element = {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: parts.map((value) => ({
        type: 'element',
        tagName: 'span',
        properties: {},
        children: [{ type: 'text', value }],
      })),
    };

    charsHighlighter(line, [chars], {
      ranges: [[]],
      idsMap: new Map(),
      counterMap: new Map(),
    });

    const highlightedChars: Array<string> = [];
    visit(line, 'element', (element) => {
      if (Object.hasOwn(element.properties, 'data-highlighted-chars')) {
        highlightedChars.push(hastToString(element));
      }
    });

    return {
      source,
      rendered: hastToString(line),
      highlightedChars,
    };
  });

  expect(results).toEqual([
    { source: 'babb', rendered: 'babb', highlightedChars: ['bb'] },
    { source: 'aaab', rendered: 'aaab', highlightedChars: ['aab'] },
    {
      source: 'abcababcab',
      rendered: 'abcababcab',
      highlightedChars: ['abcab', 'abcab'],
    },
  ]);
});

const defaultStyle = /* html */ `
<style>
  html {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  }
  body {
    margin: 30px auto;
    max-width: 800px;
  }
  pre {
    padding: 16px;
  }
  span > code {
    background: black;
    padding: 4px;
  }
  [data-highlighted-line], [data-highlighted-chars] {
    background-color: rgba(255, 255, 255, 0.25);
  }
  code[data-line-numbers] {
    counter-reset: line;
  }
  code[data-line-numbers]>[data-line]::before {
    counter-increment: line;
    content: counter(line);
    display: inline-block;
    width: 1rem;
    margin-right: 2rem;
    text-align: right;
    color: gray;
  }

  [data-rehype-pretty-code-figure] code[data-theme*=' '],
  [data-rehype-pretty-code-figure] code[data-theme*=' '] span {
    color: var(--shiki-light) !important;
    background-color: var(--shiki-light-bg) !important;
  }

  @media (prefers-color-scheme: dark) {
    [data-rehype-pretty-code-figure] code[data-theme*=' '],
    [data-rehype-pretty-code-figure] code[data-theme*=' '] span {
      color: var(--shiki-dark) !important;
      background-color: var(--shiki-dark-bg) !important;
    }
  }

  .diff.add {
    background-color: rgba(0, 255, 100, 0.25);
  }
  .diff.remove {
    background-color: rgba(255, 100, 200, 0.35);
  }
</style>
`;
