import type { Element } from 'hast';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { getElementsToHighlight } from './getElementsToHighlight';
import { wrapHighlightedChars } from './wrapHighlightedChars';
import { toString as hastToString } from 'hast-util-to-string';
import { isElement } from '../utils';

/**
 * Stands in for a node excluded from the remaining text, so the fragments
 * around it stay separated. NUL cannot occur in the highlighted source.
 */
const BOUNDARY = '\0';

/**
 * Loops through the child nodes and finds the nodes that make up the chars.
 * If the chars cross node boundaries, those nodes are wrapped with
 * <span data-highlighted-chars-mark>, and that node is passed to
 * onVisitHighlightedChars.
 *
 * If a node partially matches the chars, its content is replaced with the
 * matched part, and the left and/or right parts are cloned to sibling nodes.
 */
export function charsHighlighter(
  element: Element,
  charsList: Array<string>,
  options: CharsHighlighterOptions,
  onVisitHighlightedChars?: (
    element: CharsElement,
    id: string | undefined,
  ) => void,
) {
  const { ranges = [] } = options;
  const textContent = hastToString(element);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: char matching is inherently branchy
  charsList.forEach((chars, index) => {
    if (chars && textContent?.includes(chars)) {
      let textContent = hastToString(element);
      let startIndex = 0;

      while (textContent.includes(chars)) {
        // Snapshot the remaining text so we can bail out if an iteration
        // fails to make progress. The recomputed `textContent` excludes
        // already-highlighted nodes, so a productive iteration always makes
        // it strictly shorter; if it does not shrink, no occurrence was
        // consumed and continuing would loop forever.
        const previousTextContent = textContent;
        const currentCharsRange = ranges[index] || [];
        const id = `${chars}-${index}`;

        const elementsToWrap = getElementsToHighlight(
          element,
          chars,
          startIndex,
        );

        // maybe throw / notify due to failure here
        if (elementsToWrap.length === 0) break;

        // Count the occurrence only once it has resolved to real elements.
        // Counting before the match is confirmed lets a candidate that never
        // materializes consume a number, so a later genuine occurrence is
        // tested against the wrong index and a range like `/lo/2` misses it.
        const occurrence = (options.counterMap.get(id) || 0) + 1;
        options.counterMap.set(id, occurrence);

        const ignoreChars =
          currentCharsRange.length > 0 &&
          !currentCharsRange.includes(occurrence);

        wrapHighlightedChars(
          element,
          elementsToWrap,
          options,
          ignoreChars,
          onVisitHighlightedChars,
        );

        // re-start from the 'last' node (the chars or part of them may exist
        // multiple times in the same node)
        // account for possible extra nodes added from split with - 2
        startIndex = Math.max(
          elementsToWrap[elementsToWrap.length - 1].index - 2,
          0,
        );

        textContent = element.children
          .map((childNode) => {
            const props = isElement(childNode) ? childNode.properties : {};
            if (
              props &&
              !Object.hasOwn(props, 'rehype-pretty-code-visited') &&
              !Object.hasOwn(props, 'data-highlighted-chars-mark')
            ) {
              return hastToString(childNode);
            }
            // An excluded node is a gap in the text, not an absence. Dropping
            // it would join its neighbours: once `balloon` is split around an
            // ignored `lo`, `bal` + `on;` reads as `balon;`, which contains an
            // occurrence of `lo` the code never had. Keep a boundary so
            // fragments on either side cannot spell a synthetic match.
            return BOUNDARY;
          })
          .join('');

        // Safety guard: if the remaining text is unchanged, this iteration
        // consumed nothing, so stop instead of spinning forever.
        if (textContent === previousTextContent) break;
      }
    }
  });

  element.children.forEach((childNode) => {
    if (!isElement(childNode)) return;
    if (Object.hasOwn(childNode.properties, 'rehype-pretty-code-visited')) {
      childNode.properties['rehype-pretty-code-visited'] = undefined;
    }
  });
}
