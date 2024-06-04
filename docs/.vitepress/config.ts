import {
  transformerTwoslash,
  defaultHoverInfoProcessor,
} from '@shikijs/vitepress-twoslash';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerCompactLineOptions,
} from '@shikijs/transformers';
import { defineConfig } from 'vitepress';
import viteConfig from '../vite.config.ts';
import moonlight from './theme/moonlight-ii.json' with { type: 'json' };

const SITE_URL = 'https://rehype-pretty.pages.dev';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Rehype Pretty',
  description: 'Beautiful code for your MD/MDX docs',
  srcDir: './src',
  cleanUrls: true,
  vite: viteConfig,
  lastUpdated: true,
  appearance: 'force-dark',
  markdown: {
    theme: moonlight as unknown as any,
    codeTransformers: [
      transformerTwoslash({
        processHoverInfo: (info) =>
          defaultHoverInfoProcessor(info).replaceAll(
            /_shikijs_core[\w_]*\./g,
            '',
          ),
      }),
      transformerNotationDiff(),
      transformerNotationFocus(),
      transformerCompactLineOptions(),
    ],
  },
  sitemap: { hostname: SITE_URL },

  head: [
    [
      'meta',
      {
        name: 'keywords',
        content:
          'markdown, syntax highlighting, code, pretty, rehype, mdx, react, next.js, rehype, shiki',
      },
    ],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // ['meta', { name: 'theme-color', content: '#646cff' }],
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og.png` }],
    ['meta', { property: 'og:url', content: SITE_URL }],
    // Twitter
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '/' }],

    sidebar: [
      {
        text: 'rehype-pretty-code',
        link: '/getting-started',
      },
      {
        text: '@rehype-pretty/transformers',
        link: '/transformers',
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/rehype-pretty/rehype-pretty-code',
      },
      { icon: 'npm', link: 'https://npm.im/rehype-pretty-code' },
    ],
  },
});
