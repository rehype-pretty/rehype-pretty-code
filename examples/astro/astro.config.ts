import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';
import moonlightTheme from './public/theme/moonlight-ii.json';

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          keepBackground: false,
          theme: moonlightTheme,
        },
      ],
      rehypeSlug,
    ],
  },
  integrations: [
    mdx({
      extendMarkdownConfig: true,
    }),
    tailwind(),
  ],
});
