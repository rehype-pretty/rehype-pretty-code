import type { ShikiTransformer } from 'shiki';

interface FoldableSectionsOptions {
  lines?: Array<[start: number, end: number]>;
  style?: {
    collapsedLineTextColor?: string;
    collapsedLineBackgroundColor?: string;
  };
}

/**
 * A transformer that adds a foldable sections to code blocks.
 * 
 * @param {Object} options - Options for the foldable sections behavior and appearance.
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
 * import { foldableSectionsTransformer } from '@rehype-pretty/foldable-sections'
 * 
 * const html = await codeToHtml(`console.log('hello, world')`, {
 *   lang: 'ts',
 *   theme: 'houston',
 *   transformers: [
 *     foldableSectionsTransformer({
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

export function foldableSectionsTransformer(
  options: FoldableSectionsOptions = {},
): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/foldable-sections',
    code(node) {
      return node;
    },
  };
}
