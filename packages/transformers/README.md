> [!NOTE]  
> Currently in **development**.

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

### `transformerLineNumbers`

You can use this as a [`shiki` transformer](https://shiki.style/guide/transformers) in `rehype-pretty-code` by passing it to the `transformers` array.

#### `transformerLineNumbers` Options

- `autoApply`: `boolean` (default: `true`) - Whether to apply line numbers automatically to every code block.

#### Examples

##### with `rehype-pretty-code`

  ```ts
  import { unified } from 'unified'
  import remarkParse from 'remark-parse'
  import remarkRehype from 'remark-rehype'
  import rehypeStringify from 'rehype-stringify'
  import rehypePrettyCode from 'rehype-pretty-code'
  import { transformerCopyButton, transformerLineNumbers } from '@rehype-pretty/transformers'

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      transformers: [
        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 3_000,
        }),
        transformerLineNumbers({ autoApply: true }),
      ],
    })
    .use(rehypeStringify)
    .process(`\`\`\`js\nconsole.log('Hello, World!')\n\`\`\``)

  console.log(String(file))
  ```

##### with `shiki`

  ```ts
  import { codeToHtml } from 'shiki'
  import { transformerCopyButton, transformerLineNumbers } from '@rehype-pretty/transformers'

  const code = await codeToHtml('console.log("Hello World")', {
    lang: 'ts',
    theme: 'vitesse-light',
    transformers: [
      transformerCopyButton({
        visibility: 'always',
        feedbackDuration: 3_000,
      }),
      transformerLineNumbers({ autoApply: true }),
    ]
  })
  ```
