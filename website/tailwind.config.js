const colors = require('tailwindcss/colors');

module.exports = {
  plugins: [require('@tailwindcss/typography')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      typography: {
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
            pre: {
              background: 'rgba(200,200,255,0.05)',
              padding: '0.75rem 0',
              lineHeight: 2,

              '&:nth-of-type(2) .line::before': {
                content: 'counter(line)',
                counterIncrement: 'line',
                display: 'inline-block',
                width: '1rem',
                marginRight: '1rem',
                textAlign: 'right',
                color: colors.slate[600],
              },

              '&:nth-of-type(2) .line--highlighted::before': {
                color: colors.slate[400],
              },

              '> code': {
                display: 'grid',
                counterReset: 'line',

                '.word': {
                  background: 'rgba(200,200,255,0.15)',
                  padding: '0.25rem',
                  borderRadius: '0.25rem',
                },
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
            ':not(pre) > code': {
              background: 'rgba(200,200,255,0.1)',
              padding: '0.25rem',
              fontSize: '0.95rem !important',
              borderRadius: '0.25rem',
            },
          },
        },
      },
    },
  },
};
