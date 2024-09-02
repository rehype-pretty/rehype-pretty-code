import process from 'node:process';
Object.assign(process.env, { NEXT_TELEMETRY_DISABLED: '1' });

/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {Array<((config: NextConfig) => NextConfig)>} NextConfigPlugins
 */
import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import { rehypePrettyCode } from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import moonlightTheme from './assets/moonlight-ii.json' with { type: 'json' };

/** @type {NextConfigPlugins} */
const plugins = [];

/** @type {NextConfig} */
const nextConfig = {
  output: 'export',
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    reactCompiler: true,
    useLightningcss: false, // lightningcss doesn't work with postcss-loader
  },
  pageExtensions: ['md', 'mdx', 'tsx', 'ts', 'jsx', 'js'],
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

/** @satisfies {import('rehype-pretty-code').RehypePrettyCodeOptions} */
const options = {
  keepBackground: false,
  // @ts-expect-error
  theme: moonlightTheme,
  transformers: [
    transformerCopyButton({
      jsx: true,
      visibility: 'always',
      feedbackDuration: 2_500,
    }),
  ],
};

plugins.push(
  nextMDX({
    extension: /\.(md|mdx)$/,
    options: {
      remarkPlugins: [],
      rehypePlugins: [[rehypePrettyCode, options], rehypeSlug],
    },
  }),
);

export default () => plugins.reduce((_, plugin) => plugin(_), nextConfig);
