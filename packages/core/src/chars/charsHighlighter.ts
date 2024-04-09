import type { Element } from 'hast';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { getElementsToHighlight } from './getElementsToHighlight';
import { wrapHighlightedChars } from './wrapHighlightedChars';
import { toString as hastToString } from 'hast-util-to-string';
import { isElement } from '../utils';

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

  charsList.forEach((chars, index) => {
    if (chars && textContent?.includes(chars)) {
      let textContent = hastToString(element);
      let startIndex = 0;

      while (textContent.includes(chars)) {
        const currentCharsRange = ranges[index] || [];
        const id = `${chars}-${index}`;

        options.counterMap.set(id, (options.counterMap.get(id) || 0) + 1);

        const ignoreChars =
          currentCharsRange.length > 0 &&
          !currentCharsRange.includes(options.counterMap.get(id) ?? -1);

        const elementsToWrap = getElementsToHighlight(
          element,
          chars,
          startIndex,
          ignoreChars,
        );

        // maybe throw / notify due to failure here
        if (elementsToWrap.length === 0) break;

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
          })
          .join('');
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
