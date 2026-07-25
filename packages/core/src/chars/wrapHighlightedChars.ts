import type { Element } from 'hast';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { isElement, isText } from '../utils';

function markElementsVisited(elementsToWrap: Array<Element>) {
  for (const element of elementsToWrap) {
    element.properties = element.properties || {};
    element.properties['rehype-pretty-code-visited'] = '';
  }
}

export function wrapHighlightedChars(
  parentElement: Element,
  elementsToWrap: Array<Element>,
  chars: string,
  options: CharsHighlighterOptions,
  ignoreWord: boolean,
  onVisitHighlightedChars?: (
    element: CharsElement,
    id: string | undefined,
  ) => void,
) {
  if (!elementsToWrap || elementsToWrap.length === 0) {
    return false;
  }

  if (ignoreWord) {
    // Every fragment belongs to the ignored occurrence. Marking only the
    // first one leaves the remaining fragments available to the next scan,
    // which can then count an overlapping, token-boundary-dependent match.
    markElementsVisited(elementsToWrap);
    return true;
  }

  const [singleElement] = elementsToWrap;
  const isSimpleSingleElement =
    elementsToWrap.length === 1 &&
    singleElement.children.length === 1 &&
    isText(singleElement.children[0]);

  if (isSimpleSingleElement) {
    const element = singleElement;
    const id = options.idsMap.get(chars);

    element.properties = element.properties || {};
    element.properties['data-highlighted-chars'] = '';
    element.properties['data-chars-id'] = id;
    element.tagName = 'mark';
    element.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: {
          style: element.properties.style,
        },
        children: element.children,
      },
    ];
    element.properties.style = undefined;

    onVisitHighlightedChars?.(element as CharsElement, id);
    element.properties = element.properties || {};
    element.properties['rehype-pretty-code-visited'] = '';
    return true;
  }

  const positions = elementsToWrap.map((element) =>
    parentElement.children.indexOf(element),
  );

  // The splice replaces a consecutive slice, which only lines up with the
  // match when the run is contiguous. Leave the tree alone rather than
  // delete siblings that were never part of it.
  const isContiguous = positions.every(
    (position, i) =>
      position !== -1 && (i === 0 || position === positions[i - 1] + 1),
  );

  if (!isContiguous) {
    return false;
  }

  const start = positions[0];

  parentElement.children.splice(start, elementsToWrap.length, {
    type: 'element',
    tagName: 'mark',
    properties: { 'data-highlighted-chars-mark': '' },
    children: elementsToWrap,
  });

  const element = parentElement.children[start];

  if (!isElement(element)) {
    return false;
  }

  const id = options.idsMap.get(chars);
  element.properties = element.properties || {};
  element.properties['data-highlighted-chars'] = '';
  element.properties['data-chars-id'] = id;
  element.tagName = 'mark';
  onVisitHighlightedChars?.(element as CharsElement, id);
  element.properties = element.properties || {};
  element.properties['rehype-pretty-code-visited'] = '';
  return true;
}
