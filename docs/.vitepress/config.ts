import {
  transformerTwoslash,
  defaultHoverInfoProcessor,
} from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';

const SITE_URL = 'https://rehype-pretty.pages.dev';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Rehype Pretty',
  description: 'Beautiful code for your MD/MDX docs',
  srcDir: './src',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  assetsDir: './public',

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    codeTransformers: [
      transformerTwoslash({
        processHoverInfo: (info) =>
          defaultHoverInfoProcessor(info).replaceAll(
            /_shikijs_core[\w_]*\./g,
            '',
          ),
      }),
    ],
  },
  sitemap: { hostname: SITE_URL },
  head: [
    [
      'meta',
      {
        name: 'keywords',
        content: 'react, ethereum, typescript, react, react hooks, open source',
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
    ['meta', { name: 'twitter:image', content: '__TODO__' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
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
