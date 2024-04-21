export const prerender = true;
export const trailingSlash = 'always';

import { toHTML } from '$/lib/markdown.ts';
import type { PageLoad } from './$types.ts';

const languageIds = {
  pl: 'perl',
  lsp: 'lisp',
  ex: 'elixir',
  ts: 'typescript',
};

export const load = (async (_event) => {
  /**
   * You can also `fetch` each file individually using `_event.fetch`
   */
  const rawSnippets = import.meta.glob('/src/lib/snippets/*', {
    query: '?raw',
    import: 'default',
  });

  const parsedSnippets = [];
  for await (const [path, snippetPromise] of Object.entries(rawSnippets)) {
    const filename = path.split('/').pop();
    if (!filename) throw new Error('Invalid filename');

    const fileExtension = filename.split('.').pop() as keyof typeof languageIds;
    if (!fileExtension) throw new Error('Invalid file extension');

    const promise = await snippetPromise();
    if (typeof promise !== 'string') throw new Error('Invalid snippet content');

    const snippetTitle = filename.split('-').at(-1)?.split('.').at(0);
    const processedResult = await toHTML(
      `\`\`\`${languageIds[fileExtension]} title="${snippetTitle}"\n${promise}\n\`\`\``,
    );

    parsedSnippets.push({ filename, code: String(processedResult) });
  }
  return {
    title: 'Fibonacci Sequence',
    snippets: parsedSnippets,
  };
}) satisfies PageLoad;
