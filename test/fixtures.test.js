import rehypePrettyCode from '../src';
import { lstatSync, readFileSync, readdirSync } from 'fs';
import { toHtml } from 'hast-util-to-html';
import { toMatchFile } from 'jest-file-snapshot';
import jest from 'jest-mock';
import { toHast } from 'mdast-util-to-hast';
import { dirname, join, parse } from 'path';
import prettier from 'prettier';
import { remark } from 'remark';
import { getHighlighter as shikiHighlighter } from 'shiki';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
expect.extend({ toMatchFile });

const fixturesFolder = join(__dirname, 'fixtures');
const resultsFolder = join(__dirname, 'results');

const getHTML = async (code, settings) => {
  const hAST = toHast(remark().parse(code), { allowDangerousHtml: true });
  await rehypePrettyCode(settings)(hAST);
  return toHtml(hAST, { allowDangerousHtml: true });
};

const getTheme = (multiple) => {
  const singleTheme = JSON.parse(
    readFileSync(
      join(__dirname, '../node_modules/shiki/themes/github-dark.json'),
      'utf-8',
    ),
  );

  const multipleTheme = {
    dark: JSON.parse(
      readFileSync(
        join(__dirname, '../node_modules/shiki/themes/github-dark.json'),
        'utf-8',
      ),
    ),
    light: JSON.parse(
      readFileSync(
        join(__dirname, '../node_modules/shiki/themes/github-light.json'),
        'utf-8',
      ),
    ),
  };
  return multiple ? multipleTheme : singleTheme;
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
    keepBackground: resultHTMLName.includes('keepBackground'),
    filterMetaString: (string) => string?.replace(/filename=".*"/, ''),
    theme: getTheme(isMultipleThemeTest(testName)),
    onVisitHighlightedLine(node) {
      node.properties.className = ['highlighted'];
    },
    onVisitHighlightedWord(node, id) {
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
    onVisitLine(node) {},
    getHighlighter,
  });

  const htmlString = prettier.format(html, { parser: 'html' });
  return { htmlString, resultHTMLPath };
};

describe('Single theme', () => {
  const getHighlighter = jest.fn(shikiHighlighter);

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

      expect(defaultStyle + htmlString).toMatchFile(resultHTMLPath);
      expect(getHighlighter).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Multiple theme', () => {
  const getHighlighter = jest.fn(shikiHighlighter);

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

      expect(defaultStyle + htmlString).toMatchFile(resultHTMLPath);
      expect(getHighlighter).toHaveBeenCalledTimes(2);
    });
  });
});

it("highlighter caches don't overwrite each other", async () => {
  const [html1, html2] = await Promise.all([
    getHTML('`[1, 2, 3]{:js}`', { theme: 'github-light' }),
    getHTML('`[1, 2, 3]{:js}`', { theme: 'light-plus' }),
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
    background: black;
    display: grid;
    padding: 16px;
  }
  span > code {
    background: black;
    padding: 4px;
  }
  .highlighted, .word {
    background-color: rgba(255, 255, 255, 0.25);
  }
  code[data-line-numbers] {
    counter-reset: line;
  }
  code[data-line-numbers]>.line:before {
    counter-increment: line;
    content: counter(line);
    display: inline-block;
    width: 1rem;
    margin-right: 2rem;
    text-align: right;
    color: gray;
  }
</style>
`;
