import type { Element, Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import { toString as hastToString } from 'hast-util-to-string';
import { toHast } from 'mdast-util-to-hast';
import rehypeParse from 'rehype-parse';
import { remark } from 'remark';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import rehypePrettyCode, { type Options } from '../src';

const SINGLE_THEME: Options['theme'] = 'github-dark';
const MULTIPLE_THEMES: Options['theme'] = {
  dark: 'github-dark',
  light: 'github-light',
};

// Raw HTML is NOT allowed here: untrusted Markdown must not be able to create
// elements through code regardless of the host's raw-HTML settings.
async function render(markdown: string, options: Options) {
  const tree = toHast(remark().parse(markdown)) as Root;
  // @ts-expect-error
  await rehypePrettyCode(options)(tree);
  const html = toHtml(tree);
  const reparsed = unified().use(rehypeParse, { fragment: true }).parse(html);
  return { html, reparsed };
}

function collect(tree: Root, language: string) {
  const tagNames: Array<string> = [];
  const eventHandlers: Array<string> = [];
  let code: Element | undefined;

  visit(tree, 'element', (element) => {
    tagNames.push(element.tagName);
    for (const key of Object.keys(element.properties)) {
      if (/^on/i.test(key)) {
        eventHandlers.push(`${element.tagName}.${key}`);
      }
    }
    if (
      element.tagName === 'code' &&
      element.properties.dataLanguage === language
    ) {
      code = element;
    }
  });

  return { tagNames, eventHandlers, codeText: code && hastToString(code) };
}

function expectInert(
  { html, reparsed }: Awaited<ReturnType<typeof render>>,
  language: string,
  payload: string,
) {
  const { tagNames, eventHandlers, codeText } = collect(reparsed, language);

  expect(eventHandlers).toEqual([]);
  for (const tag of ['img', 'script', 'svg', 'a']) {
    expect(tagNames).not.toContain(tag);
  }
  expect(html).not.toMatch(/<(img|script|svg|a)[\s>]/i);
  expect(codeText).toBe(payload);
}

const payloads = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '</span></code></pre><svg onload=alert(1)>',
  '<a href="javascript:alert(1)">x</a>',
];

describe.each([
  ['single theme', SINGLE_THEME],
  ['multiple themes', MULTIPLE_THEMES],
])('untrusted code content (%s)', (_, theme) => {
  it.each(payloads)('inline token: renders %s as text', async (payload) => {
    const result = await render(`\`${payload}{:.keyword}\``, { theme });
    expectInert(result, '.token', payload);
  });

  it.each(payloads)('inline lang: renders %s as text', async (payload) => {
    const result = await render(`\`${payload}{:js}\``, { theme });
    expectInert(result, 'js', payload);
  });

  it.each(payloads)('block: renders %s as text', async (payload) => {
    const result = await render(['```js', payload, '```'].join('\n'), {
      theme,
    });
    expectInert(result, 'js', payload);
  });

  it('inline token: keeps entity-like text literal', async () => {
    // Code spans don't decode entities, so the text node holds "&lt;b&gt;".
    // Interpolating it into an HTML string would decode it to "<b>".
    const { reparsed } = await render('`&lt;b&gt;bold{:.keyword}`', {
      theme,
    });
    const { tagNames, codeText } = collect(reparsed, '.token');

    expect(tagNames).not.toContain('b');
    expect(codeText).toBe('&lt;b&gt;bold');
  });
});

describe('inline token colour', () => {
  async function getTokenStyle(theme: Options['theme']) {
    const { reparsed } = await render('`const{:.keyword}`', { theme });
    let style: unknown;
    visit(reparsed, 'element', (element) => {
      if (element.tagName === 'span' && hastToString(element) === 'const') {
        style = element.properties.style;
      }
    });
    return style;
  }

  it('applies the colour for a single theme', async () => {
    expect(await getTokenStyle(SINGLE_THEME)).toMatch(
      /^color:#[0-9a-f]{3,8}$/i,
    );
  });

  it('applies a colour variable for every theme', async () => {
    expect(await getTokenStyle(MULTIPLE_THEMES)).toMatch(
      /^--shiki-dark:#[0-9a-f]{3,8};--shiki-light:#[0-9a-f]{3,8}$/i,
    );
  });
});
