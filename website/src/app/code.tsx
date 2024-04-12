import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { copyButtonTransformer } from '@rehype-pretty/transformers';

/**
 * Server Component example
 */

export async function Code({ code }: { code: string }) {
  const highlightedCode = await highlightCode(code);
  return (
    <section
      dangerouslySetInnerHTML={{
        __html: highlightedCode,
      }}
    />
  );
}

async function highlightCode(code: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      keepBackground: false,
      transformers: [copyButtonTransformer({ feedbackDuration: 3_000 })],
    })
    .use(rehypeStringify)
    .process(code);

  return String(file);
}
