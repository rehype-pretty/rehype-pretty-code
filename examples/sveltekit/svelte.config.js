import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    alias: {
      $: './src',
    },
  },
};
