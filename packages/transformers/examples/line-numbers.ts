import { unified } from 'unified';
import { codeToHtml } from 'shiki';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import { transformerLineNumbers } from '../src/line-numbers.ts';

/* Usage with `rehype-pretty-code` */

const withRehypePrettyCode = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypePrettyCode, {
    transformers: [transformerLineNumbers({ autoApply: true })],
  })
  .use(rehypeStringify)
  .process(`\`\`\`ts\nconsole.log('Hello, World!');\n\`\`\``);

/* Usage with `shiki` directly */

const withShikiDirectly = await codeToHtml('console.log("Hello World")', {
  lang: 'ts',
  theme: 'vitesse-light',
  transformers: [transformerLineNumbers({ autoApply: true })],
});

console.info(
  JSON.stringify({ withRehypePrettyCode, withShikiDirectly }, undefined, 2),
);
