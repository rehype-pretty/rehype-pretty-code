import { Element } from 'hast';
import { VisitableElement, WordHighlighterOptions } from '../types';
import { isElement, isText } from '../utils';

export function wrapHighlightedWords(
  parentElement: Element,
  elementsToWrap: Array<{ element: Element; index: number }>,
  options: WordHighlighterOptions,
  ignoreWord: boolean,
  onVisitHighlightedWord?: (
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

    onVisitHighlightedWord?.(
      parentElement.children[elementsToWrap[0].index] as VisitableElement,
      options.wordIdsMap.get(wordStr)
    );
  } else {
    const [{ element }] = elementsToWrap;
    const textElement = element.children[0];

    if (!isText(textElement)) {
      return;
    }

    onVisitHighlightedWord?.(
      element as VisitableElement,
      options.wordIdsMap.get(textElement.value)
    );
    // used to skip already parsed words
    if (element.properties) {
      element.properties['rehype-pretty-code-visited'] = '';
    }
  }
}
