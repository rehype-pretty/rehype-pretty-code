import { splicer } from './utilities';
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
  const [lineFoldStart, lineFoldEnd] = [4, 10];

  return {
    name: '@rehype-pretty/transformers/foldable-lines',

    preprocess(code, _options) {
      const [linesBeforeFold, foldLines, _linesAfterFold] = splicer(
        code.split('\n'),
        lineFoldStart,
        lineFoldEnd,
      );

      console.log(foldLines);
      // console.log(_options.meta)
      return linesBeforeFold.join('\n');
    },
    code(_node) {
      // const [lineFoldStart, lineFoldEnd] = [1, 3];
      // const [linesBeforeFold, foldLines, linesAfterFold] = splicer(
      //   node.children,
      //   lineFoldStart,
      //   lineFoldEnd,
      // );
      // console.log(
      //   node.children
      // );
      // node.children.splice(lineFoldStart + 1, (lineFoldEnd + 1) - lineFoldStart, {
      //   type: 'element',
      //   tagName: 'details',
      //   properties: {},
      //   children: [
      //     {
      //       type: 'element',
      //       tagName: 'summary',
      //       properties: {
      //         style: 'cursor: pointer; display: flex; align-items: center; padding: 0 16px 0px 16px; border: 1px solid #e1e1e1; border-radius: 4px;',
      //       },
      //       children: [
      //         {
      //           type: 'element',
      //           tagName: 'img',
      //           properties: {
      //             src: collapseSvg,
      //             alt: 'collapse',
      //             style: 'width: 1.5em; height: 1.5em;',
      //           },
      //           children: [],
      //         },
      //         {
      //           type: 'text',
      //           value: ` ${lineFoldStart} - ${lineFoldEnd}`,
      //         },
      //       ],
      //     },
      //     {
      //       type: 'element',
      //       tagName: 'pre',
      //       properties: {},
      //       children: [
      //         {
      //           type: 'element',
      //           tagName: 'code',
      //           properties: {
      //             style: 'border: 1px solid #e1e1e1; border-radius: 4px;'
      //           },
      //           children: foldLines,
      //         },
      //       ],
      //     },
      //   ],
      // });
      // node.children.push({
      //   type: 'element',
      //   tagName: 'style',
      //   properties: {},
      //   children: [
      //     {
      //       type: 'text',
      //       value: /* css */ ``,
      //     },
      //   ],
      // });
      // return node;
    },
    tokens(tokens) {
      console.log(tokens);
    },

    postprocess: (html) => html,
  };
}
const _collapseSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M4 12h16v2H4zm0-3h16v2H4zm12-5l-4 4l-4-4h3V1h2v3zM8 19l4-4l4 4h-3v3h-2v-3z'/%3E%3C/svg%3E";
