import * as React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';

/**
 * Server Component example
 */

export async function Code({ code }: { code: string }) {
  code = await highlightCode(code);
  return (
    <React.Fragment>
      <section dangerouslySetInnerHTML={{ __html: code }} />
    </React.Fragment>
  );
}

async function highlightCode(code: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(code);

  return String(file);
}
