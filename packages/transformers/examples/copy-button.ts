import { unified } from 'unified';
import { codeToHtml } from 'shiki';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { transformerCopyButton } from '../src/copy-button.ts';

/* Usage with `rehype-pretty-code` */

const withRehypePrettyCode = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypePrettyCode, {
    transformers: [
      transformerCopyButton({
        visibility: 'always',
        feedbackDuration: 3_000,
      }),
    ],
  })
  .use(rehypeStringify)
  .process(`\`\`\`ts\nconsole.log('Hello, World!');\n\`\`\``);

/* Usage with `shiki` directly */

const withShikiDirectly = await codeToHtml('console.log("Hello World")', {
  lang: 'ts',
  theme: 'vitesse-light',
  transformers: [
    transformerCopyButton({
      visibility: 'always',
      feedbackDuration: 3_000,
    }),
  ],
});

console.info(
  JSON.stringify({ withRehypePrettyCode, withShikiDirectly }, undefined, 2),
);
