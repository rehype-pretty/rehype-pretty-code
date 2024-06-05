import url from 'node:url';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    // vue(),
    UnoCSS(url.fileURLToPath(new URL('./unocss.config.ts', import.meta.url))),
    vueJsx(),
  ],
});
