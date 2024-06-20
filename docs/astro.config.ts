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
          keepBackground: false,
          theme: moonlightTheme,
          transformers: [
            transformerCopyButton({
              visibility: 'always',
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
      favicon: '/favicon.ico',
      social: {
        github: 'https://github.com/rehype-pretty/rehype-pretty-code',
      },
      lastUpdated: true,
      customCss: ['./src/styles/tailwind.css', './src/styles/index.css'],
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
          badge: 'experimental',
          autogenerate: {
            directory: 'plugins',
            collapsed: false,
          },
        },
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
