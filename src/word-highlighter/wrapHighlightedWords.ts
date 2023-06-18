import type { Element } from 'hast';
import { VisitableElement } from '../types';
import { WordHighlighterOptions } from '../types';
import { isElement, isText } from '../utils';

export function wrapHighlightedWords(
  parentElement: Element,
  elementsToWrap: Array<{ element: Element; index: number }>,
  options: WordHighlighterOptions,
  ignoreWord: boolean,
  onVisitHighlightedWord?: (
    word: VisitableElement,
    id: string | undefined
  ) => void
) {
  if (!elementsToWrap || elementsToWrap.length === 0) return;
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

    const el = parentElement.children[elementsToWrap[0].index];

    const wordStr = isElement(el)
      ? el.children.reduce((acc, element) => {
          const child = isElement(element) ? element.children[0] : null;
          return acc + (isText(child) ? child.value : '');
        }, '')
      : '';

    onVisitHighlightedWord?.(
      parentElement.children[
        elementsToWrap[0].index
      ] as unknown as VisitableElement,
      options.wordIdsMap.get(wordStr)
    );
  } else {
    const [{ element }] = elementsToWrap;
    const textElement = element.children[0];

    if (!isText(textElement)) {
      return;
    }

    const wordStr = textElement.value;
    onVisitHighlightedWord?.(
      element as unknown as VisitableElement,
      options.wordIdsMap.get(wordStr)
    );
    // used to skip already parsed words
    if (element.properties) {
      element.properties['rehype-pretty-code-visited'] = '';
    }
  }
}
