import { expect, describe, it, vi } from 'vitest';
import rehypePrettyCode from '../src';
import { lstatSync, readFileSync, readdirSync } from 'fs';
import { toHtml } from 'hast-util-to-html';
import { toHast } from 'mdast-util-to-hast';
import { dirname, join, parse } from 'node:path';
import { remark } from 'remark';
import { getHighlighter as shikiHighlighter } from 'shikiji';
import { fileURLToPath } from 'node:url';
import qs from 'node:querystring';
import { transformerNotationDiff } from 'shikiji-transformers';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesFolder = join(__dirname, 'fixtures');
const resultsFolder = join(__dirname, 'results');

const getHTML = async (code, options) => {
  const hAST = toHast(remark().parse(code), { allowDangerousHtml: true });
  await rehypePrettyCode(options)(hAST);
  return toHtml(hAST, { allowDangerousHtml: true });
};

const getTheme = (multiple) => {
  return multiple
    ? { dark: 'github-dark', light: 'github-light' }
    : 'github-dark';
};

const isMultipleThemeTest = (fixtureName) => {
  return fixtureName.toLowerCase().includes('multipletheme');
};

// To add a test, create a markdown file in the fixtures folder
const runFixture = async (fixture, fixtureName, getHighlighter) => {
  const testName = parse(fixtureName).name;
  const resultHTMLName = `${testName}.html`;
  const resultHTMLPath = join(resultsFolder, resultHTMLName);

  const code = readFileSync(fixture, 'utf8');

  const html = await getHTML(code, {
    keepBackground: !resultHTMLName.includes('keepBackground'),
    defaultLang: (() => {
      if (testName === 'no-highlighting') {
        return undefined;
      }

      const lang = testName.split('.')[1];
      if (!lang) {
        return undefined;
      }
      if (lang === 'js') {
        return 'js';
      }
      return qs.parse(lang);
    })(),
    filterMetaString: (string) => string?.replace(/filename=".*"/, ''),
    theme: getTheme(isMultipleThemeTest(testName)),
    onVisitHighlightedLine(node) {
      node.properties.className = ['highlighted'];
    },
    onVisitHighlightedChars(node, id) {
      node.properties.className = ['word'];

      if (id) {
        const textColor = { a: 'pink', b: 'cyan', c: 'lightblue', id: 'white' };
        const backgroundColor = {
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
    onVisitLine(node) {
      node;
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
  return { htmlString, resultHTMLPath };
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
      const { htmlString, resultHTMLPath } = await runFixture(
        fixture,
        fixtureName,
        getHighlighter,
      );

      expect(defaultStyle + htmlString).toMatchFileSnapshot(resultHTMLPath);
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
      const { htmlString, resultHTMLPath } = await runFixture(
        fixture,
        fixtureName,
        getHighlighter,
      );

      expect(defaultStyle + htmlString).toMatchFileSnapshot(resultHTMLPath);
    });
  });
});

it("highlighter caches don't overwrite each other", async () => {
  const [html1, html2] = await Promise.all([
    getHTML('`[1, 2, 3]{:js}`', { theme: 'github-light' }),
    getHTML('`[1, 2, 3]{:js}`', { theme: 'github-dark' }),
  ]);
  // both highlighters are being cached under the same key, but in separate caches,
  // that's what we're testing here by asserting that they yield different results
  expect(html1).not.toBe(html2);
});

const defaultStyle = `
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
