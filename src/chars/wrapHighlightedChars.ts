import type { Element } from 'hast';
import type { CharsHighlighterOptions } from '../types';
import type { VisitableElement } from '../..';
import { isElement, isText } from '../utils';

export function wrapHighlightedChars(
  parentElement: Element,
  elementsToWrap: Array<{ element: Element; index: number }>,
  options: CharsHighlighterOptions,
  ignoreWord: boolean,
  onVisitHighlightedChars?: (
    element: VisitableElement,
    id: string | undefined
  ) => void
) {
  if (!elementsToWrap || elementsToWrap.length === 0) {
    return;
  }

  const [{ element }] = elementsToWrap;

  if (ignoreWord) {
    if (element.properties) {
      element.properties['rehype-pretty-code-visited'] = '';
    }
    return;
  }

  if (elementsToWrap.length > 1) {
    parentElement.children.splice(
      elementsToWrap[0].index,
      elementsToWrap.length,
      {
        type: 'element',
        tagName: 'span',
        properties: { 'data-rehype-pretty-code-wrapper': true },
        children: elementsToWrap.map(({ element }) => element),
      }
    );

    const element = parentElement.children[elementsToWrap[0].index];

    if (!isElement(element)) {
      return;
    }

    const wordStr = element.children.reduce((acc, node) => {
      const textElement = isElement(node) ? node.children[0] : null;
      if (isText(textElement)) {
        return acc + textElement.value;
      }
      return acc;
    }, '');

    const id = options.idsMap.get(wordStr);

    if (element.properties) {
      element.properties['data-highlighted-chars'] = '';
      element.properties['data-chars-id'] = id;
    }

    onVisitHighlightedChars?.(element as VisitableElement, id);
  } else {
    const [{ element }] = elementsToWrap;
    const textElement = element.children[0];

    if (!isText(textElement)) {
      return;
    }

    const id = options.idsMap.get(textElement.value);

    if (element.properties) {
      // used to skip already parsed words
      element.properties['rehype-pretty-code-visited'] = '';
      element.properties['data-highlighted-chars'] = '';
      element.properties['data-chars-id'] = id;
    }

    onVisitHighlightedChars?.(element as VisitableElement, id);
  }
}
