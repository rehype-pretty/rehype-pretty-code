/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {Array<((config: NextConfig & any) => NextConfig)>} NextConfigPlugins
 * @typedef {import('webpack').Configuration} WebpackConfiguration
 */

import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import { rehypePrettyCode } from 'rehype-pretty-code';
import moonlightTheme from './assets/moonlight-ii.json' with { type: 'json' };
import {
  transformerCopyButton,
  transformerLineNumbers,
} from '@rehype-pretty/transformers';

/** @type {NextConfigPlugins} */
const plugins = [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['md', 'mdx', 'tsx', 'ts', 'jsx', 'js'],
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

/** @type {import('rehype-pretty-code').RehypePrettyCodeOptions} */
const options = {
  keepBackground: false,
  // @ts-expect-error
  theme: moonlightTheme,
  transformers: [
    transformerCopyButton({
      jsx: true, // required for React
      visibility: 'always',
      feedbackDuration: 2_500,
    }),
    transformerLineNumbers({ autoApply: false }),
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
