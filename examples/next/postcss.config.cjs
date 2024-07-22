/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.ts' },
    autoprefixer: {},
  },
};
