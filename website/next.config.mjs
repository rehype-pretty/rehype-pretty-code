import process from 'node:process';
Object.assign(process.env, { NEXT_TELEMETRY_DISABLED: '1' });

/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {Array<((config: NextConfig) => NextConfig)>} NextConfigPlugins
 */
import fs from 'node:fs';
import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {NextConfigPlugins} */
const plugins = [];

/** @type {NextConfig} */
const nextConfig = {
  output: 'export',
  cleanDistDir: true,
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
};

/** @type {import('rehype-pretty-code').Options} */
const options = {
  keepBackground: false,
  theme: JSON.parse(
    fs.readFileSync(
      new URL('./assets/moonlight-ii.json', import.meta.url),
      'utf-8',
    ),
  ),
};

plugins.push(
  nextMDX({
    extension: /\.mdx?$/,
    options: {
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [],
      rehypePlugins: [[rehypePrettyCode, options], rehypeSlug],
    },
  }),
);

export default () => plugins.reduce((_, plugin) => plugin(_), nextConfig);
