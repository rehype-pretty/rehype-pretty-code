import type { Element } from 'hast';
import { isElement, isText } from '../utils';

interface SplitElementProps {
  elements: Element[];
  elementToWrap: Element;
  innerString: string;
  rightString: string;
  leftString: string;
  rest: string[];
  nextElementContinues: boolean;
  index: number;
  ignoreChars: boolean;
}

export function splitElement({
  elements,
  elementToWrap,
  innerString,
  rightString,
  leftString,
  rest,
  nextElementContinues,
  index,
  ignoreChars,
}: SplitElementProps) {
  if (
    (isElement(elementToWrap) &&
      elementToWrap.children?.[0]?.type !== 'text') ||
    ignoreChars
  ) {
    return [elementToWrap, index] as const;
  }

  let newIndex = index;

  // assign the matched value to the current element
  const textElement = elementToWrap.children[0];
  if (isText(textElement)) {
    textElement.value = innerString;
  }

  let rightStr = rightString;
  const leftStr = leftString;

  // append any repetitions to the right if necessary
  if (rest.length > 0) {
    rightStr += rest
      .map((s) => (s === '' ? innerString : innerString + s))
      .join('');
  }

  if (leftStr.length > 0) {
    elements.splice(newIndex, 0, {
      ...elementToWrap,
      properties: { ...elementToWrap.properties },
      children: [{ type: 'text', value: leftStr }],
    });
  }

  if (rightStr.length > 0 && !nextElementContinues) {
    newIndex = leftStr.length > 0 ? newIndex + 2 : newIndex + 1;
    elements.splice(newIndex, 0, {
      ...elementToWrap,
      properties: { ...elementToWrap.properties },
      children: [{ type: 'text', value: rightStr }],
    });
  }

  return [elementToWrap, index + 1] as const;
}
