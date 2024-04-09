import type { ShikiTransformer } from 'shiki';

const copyButtonStyle = /* css */ `
pre:has(code) { position: relative; }
pre button.rehype-pretty-copy {
  position: absolute;
  right: 16px;
  top: 16px;
  height: 28px;
  width: 28px;
  padding: 0;
  display: flex;
  & span {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  & .ready {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhNmE2YTYiIGQ9Ik0xNiAxSDRjLTEuMSAwLTIgLjktMiAydjE0aDJWM2gxMnptMyA0SDhjLTEuMSAwLTIgLjktMiAydjE0YzAgMS4xLjkgMiAyIDJoMTFjMS4xIDAgMi0uOSAyLTJWN2MwLTEuMS0uOS0yLTItMm0wIDE2SDhWN2gxMXoiLz48L3N2Zz4=);
  }
  & .success {
    display: none;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NWZmYWEiIGQ9Im0xMCAxMy42bDUuOS01LjlxLjI3NS0uMjc1LjctLjI3NXQuNy4yNzVxLjI3NS4yNzUuMjc1Ljd0LS4yNzUuN2wtNi42IDYuNnEtLjMuMy0uNy4zdC0uNy0uM2wtMi42LTIuNnEtLjI3NS0uMjc1LS4yNzUtLjd0LjI3NS0uN3EuMjc1LS4yNzUuNy0uMjc1dC43LjI3NXoiLz48L3N2Zz4=); 
  }
  &.rehype-pretty-copied {
    & .success { display: block; }
    & .ready { display: none; }
  }
}
`;
export function copyButtonTransformer(
  options: { toggle?: number } = { toggle: 3_000 },
): ShikiTransformer {
  return {
    name: '@rehype-pretty/copy-button',
    pre(node) {
      node.children.push({
        type: 'element',
        tagName: 'style',
        properties: {},
        children: [{ type: 'text', value: copyButtonStyle }],
      });
      node.children.push({
        type: 'element',
        tagName: 'button',
        properties: {
          class: 'rehype-pretty-copy',
          'data-rehype-pretty-code': this.source,
          onclick: /* javascript */ `
            navigator.clipboard.writeText(this.dataset.rehypePrettyCode);
            this.classList.add('rehype-pretty-copied');
            setTimeout(() => this.classList.remove('rehype-pretty-copied'), ${options.toggle});
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
    },
  };
}
