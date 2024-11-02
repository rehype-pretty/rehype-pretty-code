import {
  rehypePrettyCode,
  type RehypePrettyCodeOptions,
} from 'rehype-pretty-code';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerMetaHighlight,
  transformerRenderWhitespace,
  transformerNotationHighlight,
  transformerCompactLineOptions,
  transformerNotationErrorLevel,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import {
  transformerCopyButton,
  transformerLineNumbers,
} from '@rehype-pretty/transformers';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import tailwind from '@astrojs/tailwind';
import type { RawTheme } from 'shiki/core';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import remarkSmartypants from 'remark-smartypants';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightLinksValidator from 'starlight-links-validator';
import { transformerTwoslash, rendererRich } from '@shikijs/twoslash';
import moonlightTheme from './public/theme/moonlight-ii.json' with {
  type: 'json',
};

// https://astro.build/config
export default defineConfig({
  output: 'static',
  compressHTML: true,
  markdown: {
    gfm: true,
    syntaxHighlight: false,
    remarkPlugins: [
      // @ts-expect-error
      remarkSmartypants,
      [remarkToc, { heading: 'contents', prefix: 'toc-' }],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [
        rehypePrettyCode,
        {
          grid: true,
          keepBackground: true,
          theme: moonlightTheme as unknown as RawTheme,
          transformers: [
            // twoslash is WIP
            transformerTwoslash({
              explicitTrigger: true,
              renderer: rendererRich(),
            }),
            transformerCopyButton({
              visibility: 'always',
              feedbackDuration: 2_500,
            }),
            transformerLineNumbers({ autoApply: false }),
            transformerNotationDiff(),
            transformerNotationFocus(),
            transformerMetaHighlight(),
            transformerRenderWhitespace(),
            transformerNotationHighlight(),
            transformerCompactLineOptions(),
            transformerNotationErrorLevel(),
            transformerNotationWordHighlight(),
          ],
        } satisfies RehypePrettyCodeOptions,
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
        './node_modules/@shikijs/twoslash/style-rich.css',
      ],
      plugins: [
        // starlightThemeRapide(),
        starlightHeadingBadges(),
        starlightLinksValidator(),
      ],
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
            collapsed: false,
            directory: 'plugins',
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
