import type { ShikiTransformer } from 'shiki';

interface LineNumbersOptions {
  autoApply?: boolean;
}

export function transformerLineNumbers(
  options: LineNumbersOptions = { autoApply: true },
): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/line-numbers',
    pre(node) {
      const metaStrings = this.options.meta?.__raw?.split(' ');
      const noLineNumbers = metaStrings?.includes('showLineNumbers=false');

      if (noLineNumbers) {
        node.properties['data-show-line-numbers'] = 'false';
        return node;
      }

      const showLineNumbers = metaStrings?.includes('showLineNumbers');
      if (options.autoApply || showLineNumbers) {
        node.properties['data-show-line-numbers'] = 'true';
      }

      if (!(showLineNumbers || options.autoApply)) return node;

      const startLineNumberMeta = metaStrings?.find((s) =>
        s.startsWith('startLineNumber='),
      );

      const startLineNumber =
        (Number(startLineNumberMeta?.split('=')?.at(1)) || 1) - 1;

      if (startLineNumber) {
        node.properties['data-start-line-number'] = startLineNumber.toString();
      }

      return node;
    },
    code(node) {
      const metaStrings = this.options.meta?.__raw?.split(' ');
      const noLineNumbers = metaStrings?.includes('showLineNumbers=false');

      if (noLineNumbers) {
        node.properties['data-show-line-numbers'] = 'false';
        return node;
      }

      const showLineNumbers = metaStrings?.includes('showLineNumbers');
      if (options.autoApply || showLineNumbers) {
        node.properties['data-show-line-numbers'] = 'true';
      }

      if (!(showLineNumbers || options.autoApply)) return node;

      const startLineNumberMeta = metaStrings?.find((s) =>
        s.startsWith('startLineNumber='),
      );

      const startLineNumber =
        (Number(startLineNumberMeta?.split('=')?.at(1)) || 1) - 1;

      if (startLineNumber) {
        node.properties['data-start-line-number'] = startLineNumber.toString();
      }

      return node;
    },
    root(node) {
      node.children.map((childNode) => {
        if (childNode.type === 'element' && childNode.tagName === 'pre') {
          childNode.children.push({
            type: 'element',
            tagName: 'style',
            properties: {},
            children: [{ type: 'text', value: lineNumbersStyle() }],
          });
        }
      });

      return node;
    },
  };
}

function lineNumbersStyle() {
  return /* css */ `
  pre[data-show-line-numbers='true'], code[data-show-line-numbers='true'] {
    counter-increment: step 0;
    font-variant-numeric: tabular-nums;
    counter-reset: step 0;
  }

  code[data-show-line-numbers='true'] > span[data-line]::before {
    color: #6a737d;
    text-align: right;
    margin-right: 0.75rem;
    display: inline-block;
    content: counter(step);
    counter-increment: step;
    font-variant-numeric: tabular-nums;
  }

  code[data-show-line-numbers='true'] > span[data-line]:empty::before,
  span[data-rehype-pretty-code-figure] > code > span[data-line]::before {
    content: none;
  }
`
    .replaceAll(/\n/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}
