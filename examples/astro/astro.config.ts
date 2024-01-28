import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';
import moonlightTheme from './public/theme/moonlight-ii.json';

export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: moonlightTheme,
        },
      ],
    ],
  },
  integrations: [mdx(), tailwind()],
});
