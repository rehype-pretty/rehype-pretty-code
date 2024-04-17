import type { ShikiTransformer } from 'shiki';

interface CopyButtonOptions {
  feedbackDuration?: number;
  copyIcon?: string;
  successIcon?: string;
  visibility?: 'hover' | 'always';
}

/**
 * A transformer that adds a copy button to code blocks.
 * @param options Options for the copy button.
 * @param options.feedbackDuration The duration in milliseconds to show the success icon after copying.
 * @param options.copyIcon Either data URL svg or inline svg for the copy icon.
 * @param options.successIcon Either data URL svg or inline svg for the success icon.
 * @returns A Shiki transformer.
 *
 * find icons at https://icones.js.org
 *
 * @example
 * ```ts
 * import { codeToHtml } from 'shiki'
 * import { copyButtonTransformer } from '@rehype-pretty/copy-button'
 *
 * const html = await codeToHtml(`console.log('hello, world')`, {
 *   lang: 'ts',
 *   theme: 'houston',
 *   transformers: [
 *     copyButtonTransformer({
 *       visibility: 'always',
 *       feedbackDuration: 2_000,
 *     }),
 *   ],
 * })
 * ```
 */
export function copyButtonTransformer(
  options: CopyButtonOptions = {
    visibility: 'hover',
    feedbackDuration: 3_000,
  },
): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/copy-button',
    code(node) {
      const _totalLinesCount = node.children.filter(
        (child) => 'tagName' in child && child.tagName === 'span',
      ).length;

      node.children.push({
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          data: this.source,
          class: 'rehype-pretty-copy',
          onclick: /* javascript */ `
            navigator.clipboard.writeText(this.attributes.data.value);
            this.classList.add('rehype-pretty-copied');
            setTimeout(() => this.classList.remove('rehype-pretty-copied'), ${options.feedbackDuration});
          `,
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'ready' },
            children: [],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'success' },
            children: [],
          },
        ],
      });
      node.children.push({
        type: 'element',
        tagName: 'style',
        properties: {},
        children: [
          {
            type: 'text',
            value: copyButtonStyle({
              copyIcon: options.copyIcon,
              successIcon: options.successIcon,
              visibility: options.visibility,
            }),
          },
        ],
      });
    },
  };
}

function copyButtonStyle({
  copyIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23adadad' d='M16.187 9.5H12.25a1.75 1.75 0 0 0-1.75 1.75v28.5c0 .967.784 1.75 1.75 1.75h23.5a1.75 1.75 0 0 0 1.75-1.75v-28.5a1.75 1.75 0 0 0-1.75-1.75h-3.937a4.25 4.25 0 0 1-4.063 3h-7.5a4.25 4.25 0 0 1-4.063-3M31.813 7h3.937A4.25 4.25 0 0 1 40 11.25v28.5A4.25 4.25 0 0 1 35.75 44h-23.5A4.25 4.25 0 0 1 8 39.75v-28.5A4.25 4.25 0 0 1 12.25 7h3.937a4.25 4.25 0 0 1 4.063-3h7.5a4.25 4.25 0 0 1 4.063 3M18.5 8.25c0 .966.784 1.75 1.75 1.75h7.5a1.75 1.75 0 1 0 0-3.5h-7.5a1.75 1.75 0 0 0-1.75 1.75'/%3E%3C/svg%3E",
  successIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2366ff85' d='M9 16.17L5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41z'/%3E%3C/svg%3E",
  visibility = 'hover',
}: {
  copyIcon?: string;
  successIcon?: string;
  visibility?: 'hover' | 'always';
} = {}) {
  let copyButtonStyle = /* css */ `
    :root {
      --copy-icon: url("${copyIcon}");
      --success-icon: url("${successIcon}");
    }
    pre:has(code) {
      position: relative;
    }
    pre button.rehype-pretty-copy {
      right: 1px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      margin-top: 4px;
      margin-right: 8px;
      position: absolute;
      & span {
        width: 100%;
        aspect-ratio: 1 / 1;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      & .ready {
        background-image: var(--copy-icon);
      }
      & .success {
        display: none; background-image: var(--success-icon);
      }
    }
    &.rehype-pretty-copied { 
      & .success { 
        display: block;
      } & .ready {
        display: none;
      }
    }
    pre button.rehype-pretty-copy.rehype-pretty-copied {
      opacity: 1;
      & .ready { display: none; }
      & .success { display: block; }
    }
`;
  if (visibility === 'hover') {
    copyButtonStyle += /* css */ `
        pre button.rehype-pretty-copy { opacity: 0; }
        figure[data-rehype-pretty-code-figure]:hover > pre > code button.rehype-pretty-copy {
          opacity: 1;
        }
      `;
  }
  return copyButtonStyle;
}
