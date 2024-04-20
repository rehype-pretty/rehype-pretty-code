import { unified } from 'unified';
import { codeToHtml } from 'shiki';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { transformerFoldableSections } from '../src/foldable-sections.ts';

/* Usage with `rehype-pretty-code` */

const withRehypePrettyCode = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypePrettyCode, {
    transformers: [
      transformerFoldableSections({
        lines: [
          [1, 3],
          [5, 7],
        ],
        style: {
          collapsedLineTextColor: '#333',
          collapsedLineBackgroundColor: '#f0f0f0',
        },
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
    transformerFoldableSections({
      lines: [
        [1, 3],
        [5, 7],
      ],
      style: {
        collapsedLineTextColor: '#333',
        collapsedLineBackgroundColor: '#f0f0f0',
      },
    }),
  ],
});

console.info(
  JSON.stringify({ withRehypePrettyCode, withShikiDirectly }, undefined, 2),
);
