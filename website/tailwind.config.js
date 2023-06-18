const colors = require('tailwindcss/colors');

const linkHeadingStyles = {
  color: colors.gray[100],
  borderBottomColor: 'transparent !important',
  '&:hover': {
    color: `${colors.gray[900]} !important`,
  },
};

module.exports = {
  plugins: [require('@tailwindcss/typography')],
  content: ['./src/**/*.{js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      typography: {
        xl: {
          css: {
            pre: {
              padding: '0.75rem 0',
              lineHeight: '2.25',
              fontSize: '1rem',
            },
          },
        },
        lg: {
          css: {
            code: {
              '> .line': {
                borderLeft: `2px solid transparent`,
              },
            },
          },
        },
        DEFAULT: {
          css: {
            'h1,h2,h3,h4,h5,h6': { color: colors.white },
            'h2 a': linkHeadingStyles,
            'h3 a': linkHeadingStyles,
            'h4 a': linkHeadingStyles,
            'h5 a': linkHeadingStyles,
            'h6 a': linkHeadingStyles,
            blockquote: {
              fontSize: '90%',
              color: colors.zinc[500],
              borderLeftColor: colors.zinc[700],
              'p::before': {
                display: 'none',
              },
              'p::after': {
                display: 'none',
              },
            },
            a: {
              textDecoration: 'none',
              borderBottom: `2px solid ${colors.cyan[800]}`,
              color: colors.cyan[400],
              transition:
                'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
              '&:hover': {
                color: `${colors.zinc[900]} !important`,
                borderBottomColor: `${colors.cyan[200]} !important`,
                background: colors.cyan[200],
              },
            },
            code: {
              color: '#86e1fc',
              '&::before': {
                content: `"" !important`,
              },
              '&::after': {
                content: `"" !important`,
              },
              fontWeight: 'normal',
            },
            '[data-rehype-pretty-code-fragment]:nth-of-type(2) pre': {
              '.line::before': {
                content: 'counter(line)',
                counterIncrement: 'line',
                display: 'inline-block',
                width: '1rem',
                marginRight: '1rem',
                textAlign: 'right',
                color: colors.slate[600],
              },

              '.line--highlighted::before': {
                color: colors.slate[400],
              },
            },
            pre: {
              opacity: 0.98,
              background: 'rgba(200,200,255,0.05)',
              lineHeight: 2,

              '> code': {
                display: 'grid',
                counterReset: 'line',
                '> .line': {
                  padding: '0 1.25rem',
                  borderLeft: `2px solid transparent`,
                },
                '> .line.line--highlighted': {
                  background: 'rgba(200,200,255,0.1)',
                  borderLeftColor: colors.blue[400],
                },
              },
            },
          },
        },
      },
    },
  },
};
