import type { Element } from 'hast';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { isText } from '../utils';

function applyHighlightProperties(
  element: Element,
  chars: string,
  options: CharsHighlighterOptions,
) {
  element.properties['data-highlighted-chars'] = '';
  element.properties['data-chars-id'] = options.idsMap.get(chars);
}

function createHighlight(
  children: Element['children'],
  chars: string,
  options: CharsHighlighterOptions,
) {
  const element: Element = {
    type: 'element',
    tagName: 'mark',
    properties:
      children.length === 1 && isText(children[0])
        ? {}
        : { 'data-highlighted-chars-mark': '' },
    children,
  };

  applyHighlightProperties(element, chars, options);
  return element;
}

export function wrapHighlightedChars(
  parentElement: Element,
  elementsToWrap: Array<Element>,
  chars: string,
  options: CharsHighlighterOptions,
): CharsElement | undefined {
  if (elementsToWrap.length === 0) {
    return undefined;
  }

  const [singleElement] = elementsToWrap;
  const isSimpleSingleElement =
    elementsToWrap.length === 1 &&
    singleElement.children.length === 1 &&
    isText(singleElement.children[0]);

  if (isSimpleSingleElement) {
    const element = singleElement;
    applyHighlightProperties(element, chars, options);
    element.tagName = 'mark';
    element.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: { style: element.properties.style },
        children: element.children,
      },
    ];
    element.properties.style = undefined;
    return element as CharsElement;
  }

  const positions = elementsToWrap.map((element) =>
    parentElement.children.indexOf(element),
  );
  const isContiguous = positions.every(
    (position, index) =>
      position !== -1 && (index === 0 || position === positions[index - 1] + 1),
  );

  if (!isContiguous) {
    return undefined;
  }

  const start = positions[0];
  const element = createHighlight(elementsToWrap, chars, options);
  parentElement.children.splice(start, elementsToWrap.length, element);
  return element as CharsElement;
}

export function wrapHighlightedCharsInRange(
  parentElement: Element,
  childIndex: number,
  start: number,
  end: number,
  chars: string,
  options: CharsHighlighterOptions,
): CharsElement | undefined {
  const child = parentElement.children[childIndex];
  if (!isText(child)) {
    return undefined;
  }

  const highlight = createHighlight(
    [{ ...child, value: child.value.slice(start, end) }],
    chars,
    options,
  );
  const replacements: Element['children'] = [];

  if (start > 0) {
    replacements.push({ ...child, value: child.value.slice(0, start) });
  }
  replacements.push(highlight);
  if (end < child.value.length) {
    replacements.push({ ...child, value: child.value.slice(end) });
  }

  parentElement.children.splice(childIndex, 1, ...replacements);
  return highlight as CharsElement;
}
