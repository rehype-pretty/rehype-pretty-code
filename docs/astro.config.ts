import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerMetaHighlight,
  transformerRenderWhitespace,
  transformerNotationHighlight,
  transformerMetaWordHighlight,
  transformerNotationErrorLevel,
  transformerCompactLineOptions,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import rehypeSlug from 'rehype-slug';
import tailwind from '@astrojs/tailwind';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { rehypePrettyCode } from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import moonlightTheme from './public/theme/moonlight-ii.json' with {
  type: 'json',
};

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    shikiConfig: {
      transformers: [
        transformerNotationDiff(),
        transformerNotationFocus(),
        transformerMetaHighlight(),
        transformerRenderWhitespace(),
        transformerNotationHighlight(),
        transformerMetaWordHighlight(),
        transformerNotationErrorLevel(),
        transformerCompactLineOptions(),
        transformerNotationWordHighlight(),
      ],
    },
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          keepBackground: false,
          theme: moonlightTheme,
          transformers: [
            transformerCopyButton({
              visibility: 'hover',
              feedbackDuration: 2_500,
            }),
          ],
        },
      ],
      rehypeSlug,
    ],
  },
  integrations: [
    starlight({
      title: 'Rehype Pretty',
      social: {
        github: 'https://github.com/rehype-pretty/rehype-pretty-code',
      },
      lastUpdated: true,
      customCss: ['./src/styles/index.css'],
      plugins: [],
      sidebar: [
        {
          label: 'Rehype Pretty Code',
          link: '/',
        },
        {
          label: 'Plugins',
          autogenerate: {
            directory: 'plugins',
            collapsed: false,
          },
        },
      ],
    }),
    tailwind(),
  ],
});
