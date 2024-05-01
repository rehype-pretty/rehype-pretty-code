import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Compatible } from 'vfile';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import {
  transformerCopyButton,
  transformerFoldableLines,
} from '@rehype-pretty/transformers';

export const toHTML = (content: Compatible | undefined) =>
  unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: 'rose-pine',
      transformers: [
        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 2_500,
        }),
        transformerFoldableLines({
          lines: [[1, 2]],
        }),
      ],
    })
    .use(rehypeStringify)
    .process(content);
