// https://vitepress.dev/guide/custom-theme
import 'uno.css';
import { h } from 'vue';
import './styles/index.css';
import DefaultTheme from 'vitepress/theme';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import type { EnhanceAppContext, Theme as VitepressTheme } from 'vitepress';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp: ({ app }: EnhanceAppContext) => {
    app.use(TwoslashFloatingVue);
  },
} satisfies VitepressTheme;
