import type { Element } from 'hast';
import { toString } from 'hast-util-to-string';

/**
 * Look ahead to determine if further, sibling nodes continue the string.
 */
export function nextElementMaybeContinuesChars({
  elements,
  nextIndex,
  remainingPart,
}: {
  elements: Element[];
  nextIndex: number;
  remainingPart: string;
}): boolean {
  if (remainingPart === '') {
    return false;
  }

  const nextNode = elements[nextIndex];
  const content = getContent(nextNode);

  if (!content) {
    return false;
  }

  const includesNext =
    content.startsWith(remainingPart) || remainingPart.startsWith(content);

  const overlap = findOverlap(content, remainingPart);

  if (overlap === remainingPart && content.startsWith(remainingPart)) {
    return true;
  }

  if (includesNext) {
    return nextElementMaybeContinuesChars({
      elements,
      nextIndex: nextIndex + 1,
      remainingPart: remainingPart.replace(content, ''),
    });
  }

  return false;
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

export function reverseString(s: string) {
  return s.split('').reverse().join('');
}
