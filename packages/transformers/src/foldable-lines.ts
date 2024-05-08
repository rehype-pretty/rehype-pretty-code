import type { ShikiTransformer } from 'shiki';

interface FoldableLinesOptions {
  lines?: Array<[start: number, end: number]>;
  style?: {
    collapsedLineTextColor?: string;
    collapsedLineBackgroundColor?: string;
  };
}

/**
 * A transformer that adds a foldable lines to code blocks.
 *
 * @param {Object} options - Options for the foldable lines behavior and appearance.
 * @param {Array<[number, number]>} options.lines - The lines to be collapsed.
 * @param {Object} options.style - The style of the collapsed lines.
 * @param {string} options.style.collapsedLineTextColor - The text color of the collapsed lines.
 * @param {string} options.style.collapsedLineBackgroundColor - The background color of the collapsed lines.
 * @returns A Shiki transformer.
 *
 * @example
 *
 * ```ts
 * import { codeToHtml } from 'shiki'
 * import { transformerFoldableLines } from '@rehype-pretty/foldable-lines'
 *
 * const html = await codeToHtml(`console.log('hello, world')`, {
 *   lang: 'ts',
 *   theme: 'houston',
 *   transformers: [
 *     transformerFoldableLines({
 *       lines: [[1, 2]],
 *       style: {
 *         collapsedLineTextColor: 'white',
 *         collapsedLineBackgroundColor: 'black'
 *       }
 *     })
 *   ]
 * })
 * ```
 */

export function transformerFoldableLines(
  _options: FoldableLinesOptions = {},
): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/foldable-lines',
    preprocess(code, _options) {
      return code;
    },
    code(node) {
      return node;
    },
    postprocess(html, _options) {
      return html;
    },
  };
}
