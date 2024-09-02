import {
  rehypePrettyCode,
  type RehypePrettyCodeOptions,
} from 'rehype-pretty-code';
import mdx from '@astrojs/mdx';
import type { RawTheme } from 'shiki';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import moonlightTheme from './public/theme/moonlight-ii.json';
import { transformerCopyButton } from '@rehype-pretty/transformers';

export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: moonlightTheme as unknown as RawTheme,
          transformers: [
            transformerCopyButton({
              visibility: 'hover',
              feedbackDuration: 2_500,
            }),
          ],
        } satisfies RehypePrettyCodeOptions,
      ],
    ],
  },
  integrations: [mdx(), tailwind()],
});
