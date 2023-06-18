import { Element } from 'hast';
import { VisitableElement, WordHighlighterOptions } from '../types';
import { isElement, isText } from '../utils';

export function wrapHighlightedWords(
  parentNode: Element,
  nodesToWrap: Array<{ node: Element; index: number }>,
  options: WordHighlighterOptions,
  ignoreWord: boolean,
  onVisitHighlightedWord?: (
    element: VisitableElement,
    id: string | undefined
  ) => void
) {
  if (!nodesToWrap || nodesToWrap.length === 0) return;
  const [{ node }] = nodesToWrap;

  if (ignoreWord) {
    if (node.properties) {
      node.properties['rehype-pretty-code-visited'] = '';
    }
    return;
  }

  if (nodesToWrap.length > 1) {
    parentNode.children.splice(nodesToWrap[0].index, nodesToWrap.length, {
      type: 'element',
      tagName: 'span',
      properties: { 'data-rehype-pretty-code-wrapper': true },
      children: nodesToWrap.map(({ node }) => node),
    });

    const element = parentNode.children[nodesToWrap[0].index];

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
      parentNode.children[nodesToWrap[0].index] as unknown as VisitableElement,
      options.wordIdsMap.get(wordStr)
    );
  } else {
    const [{ node }] = nodesToWrap;
    const textElement = node.children[0];
    if (!isText(textElement)) {
      return;
    }

    const wordStr = textElement.value;
    onVisitHighlightedWord?.(
      node as unknown as VisitableElement,
      options.wordIdsMap.get(wordStr)
    );
    // used to skip already parsed words
    if (node.properties) {
      node.properties['rehype-pretty-code-visited'] = '';
    }
  }
}
