import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [tailwindcss(), vue(), vueJsx()],
});
