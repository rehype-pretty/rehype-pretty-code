import {
  lstatSync,
  readdirSync,
  readFileSync,
  type PathOrFileDescriptor,
} from 'node:fs';
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
import { toHast } from 'mdast-util-to-hast';
import rehypePrettyCode, { type Options } from '../src';
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
