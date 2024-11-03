> [!NOTE]  
> **experimental**. Please report any issues you encounter.

# `@rehype-pretty/transformers`

[![JSR](https://jsr.io/badges/@rehype-pretty/transformers)](https://jsr.io/@rehype-pretty/transformers)
[![JSR](https://jsr.io/badges/@rehype-pretty/transformers/score)](https://jsr.io/@rehype-pretty/transformers)

```sh
npx jsr add @rehype-pretty/transformers
```

## Available Transformers

- [`transformerCopyButton`](./src/copy-button.ts)
- [`transformerLineNumbers`](./src/line-numbers.ts)

## Usage

### `transformerCopyButton`

You can use this as a [`shiki` transformer](https://shiki.style/guide/transformers) in `rehype-pretty-code` by passing it to the `transformers` array.

#### `transformerCopyButton` Options

- `visibility`: `'always' | 'hover'` (default: `'hover'`)
- `feedbackDuration`: `number` (default: `3_000`)
- `copyIcon`: `string` (default: an inline SVG of a copy icon)
- `successIcon`: `string` (default: an inline SVG of a green checkmark icon)
- `jsx`: `boolean` (default: `false`) (required as `true` for React-based usage)

### `transformerLineNumbers`

You can use this as a [`shiki` transformer](https://shiki.style/guide/transformers) in `rehype-pretty-code` by passing it to the `transformers` array.

#### `transformerLineNumbers` Options

- `autoApply`: `boolean` (default: `true`) - Whether to apply line numbers automatically to every code block.

### Examples

#### direct

  ```ts
  import { unified } from 'unified'
  import remarkParse from 'remark-parse'
  import remarkRehype from 'remark-rehype'
  import rehypeStringify from 'rehype-stringify'
  import { rehypePrettyCode } from 'rehype-pretty-code'
  import { transformerCopyButton } from '@rehype-pretty/transformers'

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      transformers: [
        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 3_000,
        }),
        transformerLineNumbers({ autoApply: false }),
      ],
    })
    .use(rehypeStringify)
    .process(`\`\`\`js\nconsole.log('Hello, World!')\n\`\`\``)

  console.log(String(file))
  ```

#### In React / Next.js

In Next.js you st it up in `next.config.js` as you'd expect with `jsx: true`

```js
// next.config.js

import nextMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import { rehypePrettyCode } from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';

const plugins = [];

const nextConfig = {
  output: 'export',
  pageExtensions: ['md', 'mdx', 'tsx', 'ts', 'jsx', 'js'],
};

const const rehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: false,
  transformers: [
    transformerCopyButton({
      jsx: true, // required for React
      visibility: 'always',
      feedbackDuration: 2_500,
    }),
  ],
};

plugins.push(
  nextMDX({
    extension: /\.(md|mdx)$/,
    options: {
      remarkPlugins: [],
      rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions], rehypeSlug],
    },
  }),
);

export default () => plugins.reduce((_, plugin) => plugin(_), nextConfig);
```

Then in your client component, import the `registerCopyButton` function and call it in your the outermost **client** component.

```tsx
'use client';

import { registerCopyButton } from '@rehype-pretty/transformers';

export default function Home() {
  React.useEffect(() => {
    registerCopyButton();
  }, []);

  return (
    <MDXProvider disableParentContext={false}>
      <Index />
    </MDXProvider>
  );
}
```
