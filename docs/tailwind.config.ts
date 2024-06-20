import colors from 'tailwindcss/colors';
import type { Config } from 'tailwindcss';
import starlightPlugin from '@astrojs/starlight-tailwind';

const linkHeadingStyles = {
  color: colors.gray[100],
  borderBottomColor: 'transparent',
  borderRadius: 3,
  boxShadow: `0 0 0 0.4rem transparent`,
  '&:hover': {
    color: 'none',
    borderBottomColor: 'transparent',
    background: colors.gray[100],
    boxShadow: `0 0 0 0.4rem ${colors.gray[100]}`,
  },
};

const accent = {
  200: 'hsl(40, 100%, 94%)',
  600: '#746b4d',
  900: '#363225',
  950: '#26241c',
};
const gray = {
  100: '#f5f6f8',
  200: '#eceef2',
  300: '#c0c2c7',
  400: '#888b96',
  500: '#545861',
  700: '#353841',
  800: '#24272f',
  900: '#17181c',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [starlightPlugin()],
  theme: {
    extend: {
      colors: { accent, gray },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              background: 'rgba(205, 200, 255, 0.05)',
              code: {
                fontSize: '1rem',
              },
            },
            'h2 a': linkHeadingStyles,
            'h3 a': linkHeadingStyles,
            'h4 a': linkHeadingStyles,
            'h5 a': linkHeadingStyles,
            'h6 a': linkHeadingStyles,
            'h3 a:has(code)': {
              boxShadow: `0 0 0 0.3rem transparent`,
              '&:hover': {
                background: colors.teal[900],
                boxShadow: `0 0 0 0.3rem ${colors.teal[900]}`,
              },
            },
            figure: {
              margin: 0,
            },
            blockquote: {
              fontSize: '90%',
              color: colors.zinc[500],
              borderLeftColor: colors.zinc[700],
              'p::before': { display: 'none' },
              'p::after': { display: 'none' },
            },
            a: {
              textDecoration: 'none',
              borderBottom: `1px solid ${colors.pink[300]}`,
              color: colors.pink[200],
              borderRadius: 1,
              transitionProperty: 'color, border-color, background, box-shadow',
              transitionDuration: '0.18s',
              boxShadow: `0 0 0 0.2rem transparent`,
              '&:hover': {
                color: `${colors.zinc[900]}`,
                borderBottomColor: `${colors.pink[200]}`,
                background: colors.pink[200],
                boxShadow: `0 0 0 0.2rem ${colors.pink[200]}`,
              },
            },
            code: {
              color: '#86e1fc',
              '&::before': { content: `unset !important` },
              '&::after': { content: `unset !important` },
              fontWeight: 'normal',
            },
            'a code': {
              fontSize: '1em',
            },
            '[data-rehype-pretty-code-fragment]:nth-of-type(2) pre': {
              '[data-line]::before': {
                content: 'counter(line)',
                counterIncrement: 'line',
                display: 'inline-block',
                width: '1rem',
                marginRight: '1rem',
                textAlign: 'right',
                color: colors.slate[600],
              },
              '[data-highlighted-line]::before': {
                color: colors.slate[400],
              },
            },
          },
        },
      },
    },
  },
} satisfies Config;
