import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapterStatic({
      strict: true,
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
    }),
    alias: {
      $: './src',
    },
  },
};
