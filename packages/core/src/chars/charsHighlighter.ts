import type { Element } from 'hast';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { getElementsToHighlight } from './getElementsToHighlight';
import { wrapHighlightedChars } from './wrapHighlightedChars';
import { isElement } from '../utils';

/**
 * Loops through the child nodes and finds the nodes that make up the chars.
 * If the chars cross node boundaries, those nodes are wrapped with
 * <mark data-highlighted-chars-mark>, and that node is passed to
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

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: char matching is inherently branchy
  charsList.forEach((chars, index) => {
    if (!chars) {
      return;
    }

    const currentCharsRange = ranges[index] || [];
    const id = `${chars}-${index}`;
    let startIndex = 0;

    while (true) {
      const elementsToWrap = getElementsToHighlight(element, chars, startIndex);

      if (elementsToWrap.length === 0) break;

      const matchStartIndex = element.children.indexOf(elementsToWrap[0]);
      if (matchStartIndex === -1) break;

      const occurrence = (options.counterMap.get(id) || 0) + 1;
      const ignoreChars =
        currentCharsRange.length > 0 && !currentCharsRange.includes(occurrence);

      const didWrap = wrapHighlightedChars(
        element,
        elementsToWrap,
        chars,
        options,
        ignoreChars,
        onVisitHighlightedChars,
      );

      if (!didWrap) break;

      options.counterMap.set(id, occurrence);
      startIndex = matchStartIndex;
    }
  });

  element.children.forEach((childNode) => {
    if (!isElement(childNode)) return;
    if (Object.hasOwn(childNode.properties, 'rehype-pretty-code-visited')) {
      childNode.properties['rehype-pretty-code-visited'] = undefined;
    }
  });
}
