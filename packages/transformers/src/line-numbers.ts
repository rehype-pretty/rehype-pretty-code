import type { ShikiTransformer } from 'shiki';

interface LineNumbersOptions {
  autoApply?: boolean;
}

export function transformerLineNumbers(
  options: LineNumbersOptions = { autoApply: true },
): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/line-numbers',
    code(hast) {
      const metaStrings = this.options.meta?.__raw?.split(' ');
      const noLineNumbers = metaStrings?.includes('showLineNumbers=false');

      if (noLineNumbers) {
        hast.properties['data-show-line-numbers'] = 'false';
        return hast;
      }

      const showLineNumbers = metaStrings?.includes('showLineNumbers');
      if (options.autoApply || showLineNumbers) {
        hast.properties['data-show-line-numbers'] = 'true';
      }

      const startLineNumberMeta = metaStrings?.find((s) =>
        s.startsWith('startLineNumber='),
      );

      const startLineNumber =
        (Number(startLineNumberMeta?.split('=')?.at(1)) || 1) - 1;

      if (startLineNumber) {
        hast.properties['data-start-line-number'] = startLineNumber.toString();
      }
    },
    pre(hast) {
      const metaStrings = this.options.meta?.__raw?.split(' ');
      const noLineNumbers = metaStrings?.includes('showLineNumbers=false');

      if (noLineNumbers) {
        hast.properties['data-show-line-numbers'] = 'false';
        return hast;
      }

      const showLineNumbers = metaStrings?.includes('showLineNumbers');
      if (options.autoApply || showLineNumbers) {
        hast.properties['data-show-line-numbers'] = 'true';
      }

      if (!(showLineNumbers || options.autoApply)) return hast;

      const startLineNumberMeta = metaStrings?.find((s) =>
        s.startsWith('startLineNumber='),
      );

      const startLineNumber =
        (Number(startLineNumberMeta?.split('=')?.at(1)) || 1) - 1;

      if (startLineNumber) {
        hast.properties['data-start-line-number'] = startLineNumber.toString();
      }

      hast.children.push({
        type: 'element',
        tagName: 'style',
        properties: {},
        children: [
          {
            type: 'text',
            value: /* css */ `
              pre[data-show-line-numbers], code[data-show-line-numbers] {
                counter-increment: step 0;
                font-variant-numeric: tabular-nums;
                counter-reset: step 0;
              }
  
              code[data-show-line-numbers] > span[data-line]::before {
                color: #6a737d;
                text-align: right;
                margin-right: 0.75rem;
                display: inline-block;
                content: counter(step);
                counter-increment: step;
                font-variant-numeric: tabular-nums;
              }
  
              code[data-show-line-numbers] > span[data-line]:empty::before {
                content: none;
              }
            `.trim(),
          },
        ],
      });

      if (!noLineNumbers) {
        hast.children.push({
          type: 'element',
          tagName: 'style',
          properties: {},
          children: [],
        });
      }
    },
  };
}
