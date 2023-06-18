import { Element } from 'hast';
import { toString } from 'hast-util-to-string';

// look ahead to determine if further
// sibling nodes continue the string
export function nextNodeMaybeContinuesWord({
  elements,
  nextIndex,
  remainingPart,
}: {
  elements: Element[];
  nextIndex: number;
  remainingPart: string;
}): boolean {
  if (remainingPart === '') return false;
  const nextNode = elements[nextIndex];
  const content = getContent(nextNode);
  if (!content) return false;

  const includesNext =
    content.startsWith(remainingPart) || remainingPart.startsWith(content);

  const overlap = findOverlap(content, remainingPart);

  if (overlap === remainingPart && content.startsWith(remainingPart)) {
    return true;
  }

  if (includesNext) {
    return nextNodeMaybeContinuesWord({
      elements,
      nextIndex: nextIndex + 1,
      remainingPart: remainingPart.replace(content, ''),
    });
  } else {
    return false;
  }
}

export function getContent(node: Element) {
  if (!node) return;
  return toString(node);
}

export function findOverlap(a: string, b: string): string {
  if (b.length === 0) {
    return '';
  }

  if (a.endsWith(b)) {
    return b;
  }

  if (a.indexOf(b) >= 0) {
    return b;
  }

  return findOverlap(a, b.substring(0, b.length - 1));
}

export const reverseString = (s: string) => s?.split('').reverse().join('');
