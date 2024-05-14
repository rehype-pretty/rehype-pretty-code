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

## Usage

You can use this as a [`shiki` transformer](https://shiki.style/guide/transformers) in `rehype-pretty-code` by passing it to the `transformers` array.

### Options

- `visibility`: `'always' | 'hover'` (default: `'hover'`)
- `feedbackDuration`: `number` (default: `3_000`)
- `copyIcon`: `string` (default: an inline SVG of a copy icon)
- `successIcon`: `string` (default: an inline SVG of a green checkmark icon)

### Examples

#### with `rehype-pretty-code`

  ```ts
  import { unified } from 'unified'
  import remarkParse from 'remark-parse'
  import remarkRehype from 'remark-rehype'
  import rehypeStringify from 'rehype-stringify'
  import rehypePrettyCode from 'rehype-pretty-code'
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
      ],
    })
    .use(rehypeStringify)
    .process(`\`\`\`js\nconsole.log('Hello, World!')\n\`\`\``)

  console.log(String(file))
  ```

#### with `shiki`

  ```ts
  import { codeToHtml } from 'shiki'

  const code = await codeToHtml('console.log("Hello World")', {
    lang: 'ts',
    theme: 'vitesse-light',
    transformers: [
      transformerCopyButton({
        visibility: 'always',
        feedbackDuration: 3_000,
      }),
    ]
  })
  ```
