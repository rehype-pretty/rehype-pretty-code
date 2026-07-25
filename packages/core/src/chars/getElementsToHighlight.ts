import type { Element, ElementContent, Text } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import { isElement, isText } from '../utils';

interface ContentRange {
  child: ElementContent;
  index: number;
  start: number;
  end: number;
}

type TextToken = Element & { children: [Text] };

export type HighlightTarget =
  | {
      type: 'elements';
      parent: Element;
      elements: Array<Element>;
    }
  | {
      type: 'range';
      parent: Element;
      childIndex: number;
      start: number;
      end: number;
    };

export function getContentLength(child: ElementContent) {
  if (isText(child)) {
    return child.value.length;
  }

  return isElement(child) ? hastToString(child).length : 0;
}

function isTextToken(child: ElementContent): child is TextToken {
  return (
    isElement(child) &&
    child.tagName === 'span' &&
    child.children.length === 1 &&
    isText(child.children[0])
  );
}

function cloneToken(element: TextToken, value: string) {
  const { id: _id, ...properties } = Object.fromEntries(
    Object.entries(element.properties).map(([key, property]) => [
      key,
      Array.isArray(property) ? [...property] : property,
    ]),
  );

  return {
    ...element,
    properties,
    children: [{ ...element.children[0], value }],
  };
}

function splitToken(
  parent: Element,
  element: TextToken,
  start: number,
  end: number,
) {
  const text = element.children[0];
  const value = text.value;
  const replacements: Array<Element> = [];

  if (start > 0) {
    replacements.push(cloneToken(element, value.slice(0, start)));
  }

  text.value = value.slice(start, end);
  replacements.push(element);

  if (end < value.length) {
    replacements.push(cloneToken(element, value.slice(end)));
  }

  parent.children.splice(parent.children.indexOf(element), 1, ...replacements);
  return element;
}

function getContentRange(element: Element, position: number) {
  let start = 0;
  for (let index = 0; index < element.children.length; index++) {
    const child = element.children[index];
    const end = start + getContentLength(child);

    if (start <= position && position < end) {
      return { child, index, start, end };
    }

    start = end;
  }

  return undefined;
}

function findTextRange(
  element: Element,
  start: number,
  end: number,
): HighlightTarget | undefined {
  let offset = 0;

  for (let childIndex = 0; childIndex < element.children.length; childIndex++) {
    const child = element.children[childIndex];
    const childStart = offset;
    offset += getContentLength(child);

    if (!(childStart <= start && end <= offset)) {
      continue;
    }

    if (isText(child)) {
      return {
        type: 'range',
        parent: element,
        childIndex,
        start: start - childStart,
        end: end - childStart,
      };
    }

    if (isElement(child)) {
      return findTextRange(child, start - childStart, end - childStart);
    }
  }

  return undefined;
}

function getSingleTarget(
  element: Element,
  range: ContentRange,
  start: number,
  end: number,
): HighlightTarget | undefined {
  if (
    isElement(range.child) &&
    range.child.tagName === 'span' &&
    (isTextToken(range.child) || (start === range.start && end === range.end))
  ) {
    return {
      type: 'elements',
      parent: element,
      elements: [
        isTextToken(range.child)
          ? splitToken(
              element,
              range.child,
              start - range.start,
              end - range.start,
            )
          : range.child,
      ],
    };
  }

  if (isElement(range.child)) {
    return findTextRange(range.child, start - range.start, end - range.start);
  }

  if (isText(range.child)) {
    return {
      type: 'range',
      parent: element,
      childIndex: range.index,
      start: start - range.start,
      end: end - range.start,
    };
  }

  return undefined;
}

function getMultipleTarget(
  element: Element,
  first: ContentRange,
  last: ContentRange,
  start: number,
  end: number,
): HighlightTarget | undefined {
  const selectedChildren = element.children.slice(first.index, last.index + 1);
  if (
    !(
      isTextToken(first.child) &&
      isTextToken(last.child) &&
      selectedChildren.every(isElement)
    )
  ) {
    return undefined;
  }

  const firstMatch = splitToken(
    element,
    first.child,
    start - first.start,
    first.end - first.start,
  );
  const lastMatch = splitToken(element, last.child, 0, end - last.start);
  const firstIndex = element.children.indexOf(firstMatch);
  const lastIndex = element.children.indexOf(lastMatch);

  return {
    type: 'elements',
    parent: element,
    elements: element.children
      .slice(firstIndex, lastIndex + 1)
      .filter(isElement),
  };
}

export function getElementsToHighlight(
  element: Element,
  start: number,
  end: number,
): HighlightTarget | undefined {
  const first = getContentRange(element, start);
  const last = getContentRange(element, end - 1);

  if (!(first && last)) {
    return undefined;
  }

  return first.index === last.index
    ? getSingleTarget(element, first, start, end)
    : getMultipleTarget(element, first, last, start, end);
}
