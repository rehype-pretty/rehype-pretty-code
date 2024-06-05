import 'virtual:uno.css';
import './styles/index.css';
import Layout from './Layout.vue';
import DefaultTheme from 'vitepress/theme';
import { rehypePrettyCode } from 'rehype-pretty-code';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import type { EnhanceAppContext, Theme as VitepressTheme } from 'vitepress';

export default {
  Layout,
  extends: DefaultTheme,
  enhanceApp: ({ app }: EnhanceAppContext) => {
    app.use(TwoslashFloatingVue).use(rehypePrettyCode);
  },
} satisfies VitepressTheme;
