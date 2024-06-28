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
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import tailwind from '@astrojs/tailwind';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import remarkSmartypants from 'remark-smartypants';
import { rehypePrettyCode } from 'rehype-pretty-code';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import { transformerTwoslash, rendererRich } from '@shikijs/twoslash';
import moonlightTheme from './public/theme/moonlight-ii.json' with {
  type: 'json',
};

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    shikiConfig: {
      transformers: [
        transformerTwoslash({ renderer: rendererRich() }),
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
    remarkPlugins: [
      // @ts-expect-error
      remarkSmartypants,
      [remarkToc, { heading: 'contents', prefix: 'toc-' }],
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [
        rehypePrettyCode,
        {
          keepBackground: true,
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
      expressiveCode: false,
      title: 'Rehype Pretty',
      favicon: '/favicon.ico',
      social: {
        github: 'https://github.com/rehype-pretty/rehype-pretty-code',
      },
      lastUpdated: true,
      customCss: [
        './src/styles/index.css',
        './src/styles/tailwind.css',
        '@shikijs/twoslash/style-rich.css',
      ],
      plugins: [],
      head: [
        {
          tag: 'script',
          attrs: { src: '/scripts/anchor-targets.js' },
        },
      ],
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
        {
          label: 'Examples',
          link: '/examples',
        },
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
