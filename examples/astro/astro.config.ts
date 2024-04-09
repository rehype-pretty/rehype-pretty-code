import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';
import moonlightTheme from './public/theme/moonlight-ii.json';
import { copyButtonTransformer } from '@rehype-pretty/transformers';

export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: moonlightTheme,
          transformers: [copyButtonTransformer({ toggle: 7_000 })],
        },
      ],
    ],
  },
  integrations: [mdx(), tailwind()],
});
