import {
  type Theme,
  rehypePrettyCode,
  type RehypePrettyCodeOptions,
} from 'rehype-pretty-code';
import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import type { NextConfig } from 'next';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import moonlightTheme from './assets/moonlight-ii.json' with { type: 'json' };

const plugins: Array<(config: NextConfig) => NextConfig> = [];

const nextConfig = {
  output: 'export',
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    useLightningcss: false, // lightningcss doesn't work with postcss-loader
  },
  pageExtensions: ['md', 'mdx', 'tsx', 'ts', 'jsx', 'js'],
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
} satisfies NextConfig;

const options = {
  keepBackground: false,
  theme: moonlightTheme as unknown as Theme,
  transformers: [
    transformerCopyButton({
      jsx: true,
      visibility: 'always',
      feedbackDuration: 2_500,
    }),
  ],
} satisfies RehypePrettyCodeOptions;

plugins.push(
  nextMDX({
    extension: /\.(md|mdx)$/,
    options: {
      remarkPlugins: [],
      rehypePlugins: [[rehypePrettyCode, options], rehypeSlug],
    },
  }),
);

// @ts-expect-error
export default () => plugins.reduce((_, plugin) => plugin(_), nextConfig);
