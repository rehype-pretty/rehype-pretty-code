# MDX Pretty Code

<p align="center">
  <img src="https://github.com/atomiks/mdx-pretty-code/raw/master//preview.jpg">
</p>

A Remark plugin to make the code in your MDX docs simply beautiful. Powered by
[Shiki](https://github.com/shikijs/shiki).

- ✅ Perfect VS Code highlighting (use any theme)
- ✅ Line and word highlighting
- ✅ Context-adjustable inline code highlighting
- ✅ Line numbers
- ✅ No runtime or bundle size cost

## Installation

```shell
npm install @atomiks/mdx-pretty-code shiki
```

## Usage

```js
import {createRemarkPlugin} from '@atomiks/mdx-pretty-code';
import fs from 'fs';

const prettyCode = createRemarkPlugin({
  // Options passed to shiki.getHighlighter()
  shikiOptions: {
    // Link to your VS Code theme JSON file
    theme: JSON.parse(
      fs.readFileSync(require.resolve('./themes/my-theme.json'), 'utf-8')
    ),
  },
  // These are hooks which allow you to style the node. `node` is an element
  // using JSDOM, so you can apply any CSS.
  onVisitLine(node) {
    // Style a line node.
    Object.assign(node.style, {
      margin: '0 -1.5rem',
      padding: '0 1.5rem',
    });
  },
  onVisitHighlightedLine(node) {
    // Style a highlighted line node.
    Object.assign(node.style, {
      backgroundColor: 'rgba(0,0,0,0.1)',
    });
  },
  onVisitHighlightedWord(node) {
    // Style a highlighted word node.
    Object.assign(node.style, {
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '0.25rem',
      borderRadius: '0.25rem',
    });
  },
});
```

Then pass the plugin to your MDX `remarkPlugins` option. For example, in
`next.config.js` using MDX v2:

```js
module.exports = {
  experimental: {esmExternals: true},
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          /** @type {import('@mdx-js/loader').Options} */
          options: {
            remarkPlugins: [prettyCode],
          },
        },
      ],
    });

    return config;
  },
};
```

## Multiple themes (dark/light mode)

Because Shiki generates themes at build time, client-side theme switching
support is not built in. There are two popular options for supporting something
like Dark Mode with Shiki. See the
[Shiki docs](https://github.com/shikijs/shiki/blob/main/docs/themes.md#dark-mode-support)
for more info.

#### 1. Load multiple themes

This will render duplicate code blocks for each theme. You can then hide the
other blocks with CSS.

Pass your themes to `shikiOptions.theme`, where the keys represent the color
mode:

```js
shikiOptions: {
  theme: {
    dark: JSON.parse(
      fs.readFileSync(require.resolve('./themes/dark.json'), "utf-8")
    ),
    light: JSON.parse(
      fs.readFileSync(require.resolve('./themes/light.json'), "utf-8")
    ),
  },
}
```

The `code` elements and the inline code `<span data-mdx-pretty-code>` wrappers
will have a data attribute `data-theme="[key]"`, e.g `data-theme="light"`. You
can target the data attribute `[data-theme='dark']` to apply styles for that
theme.

Now, you can use CSS to display the desired theme:

```css
@media (prefers-color-scheme: dark) {
  code[data-theme='light'] {
    display: none;
  }
}

@media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
  code[data-theme='dark'] {
    display: none;
  }
}
```

#### 2. Use the "css-variables" theme (Shiki version `0.9.9` and above)

<details>
  This gives you access to CSS variable styling, which you can control across Dark
  and Light mode.

Note that **this client-side theme is less granular than most other supported VS
Code themes**. Also, be aware that this will generate unstyled code if you do
not define these CSS variables somewhere else on your page:

```html
<style>
  :root {
    --shiki-color-text: rgb(248, 248, 242);
    --shiki-color-background: rgb(13 13 15);
    --shiki-token-constant: rgb(102, 217, 239);
    --shiki-token-string: rgb(230, 219, 116);
    --shiki-token-comment: rgb(93,93, 95);
    --shiki-token-keyword: rgb(249, 38, 114);
    --shiki-token-parameter: rgb(230, 219, 116);
    --shiki-token-function: rgb(166, 226, 46);
    --shiki-token-string-expression: rgb(230, 219, 116);
    --shiki-token-punctuation: rgb(230, 219, 116);
    --shiki-token-link: rgb(174, 129, 255);
  }
</style>
```

</details>

## API

Code blocks are configured via the meta string after the top codeblock fence.

### Line highlighting

Highlight lines 1, 2 through 4, and 6.

\`\`\`js {1,2-4,6}

### Word highlighting

Highlight the literal word `carrot`. Regex is not currently supported.

\`\`\`js /carrot/

#### Limit word highlighting to specific instances

If you want to limit which words get highlighted, this is possible. For
instance:

\`\`\`js /carrot/1-2,4

The numeric range must be directly after the `/`.

This will only highlight the first, second, and fourth instances of `carrot`,
but not the third, or fifth+.

### Inline highlighting

Append `{:lang}` (e.g. `{:js}`) at the end of the inline code to highlight it
like it's a regular code block.

```
This is `inline(){:js}` code which will be colored like a regular code block.
```

In your `MDXProvider`'s `components` prop, modify `span` like so:

```js
const mdxComponents = {
  span(props) {
    if (props['data-mdx-pretty-code'] != null) {
      return (
        <code
          data-theme={props['data-theme']}
          style={{color: props['data-color']}}
        >
          {props.children.props.children}
        </code>
      );
    }

    return <span {...props} />;
  },
};

```

#### Context-specific highlighting

Shiki will color plain variables as plain text since the highlighting has no
context. But if you're referring to a variable which was colored a different way
by Shiki in a code block above or below the inline code, it won't be semantic.

You can instruct MDX Pretty Code to color a word by supplying a token whose
color is specified in the VS Code theme.

It must start with a `.` to indicate it's a token, not a language.

```
The function name is `hello{:.entity.name.function}`.
```

You can create a `tokensMap` to shorten this throughout your docs:

```js
createRemarkPlugin({
  // ...
  tokensMap: {
    function: 'entity.name.function',
  },
});
```

Now you can just do:

```
The function name is `hello{:.function}`.
```

> Note: for the token feature to work, you must have supplied a JSON object to
> `shikiOptions.theme`, not a default Shiki theme string.

## Line numbers

CSS counters can be used to add line numbers.

```css
code {
  counter-reset: line;
}

code > .line::before {
  counter-increment: line;
  content: counter(line);

  /* Other styling */
  display: inline-block;
  width: 1rem;
  margin-right: 2rem;
  text-align: right;
  color: gray;
}
```

## Language meta

The `code` tag has a `data-language` attribute, so you can add the language
information to the code block.

## Sanitizing

All HTML is sanitized via
[`sanitize-html`](https://www.npmjs.com/package/sanitize-html). To configure the
sanitizing options, pass `sanitizeOptions`, which is 1:1 with its API.

## License

MIT
