import type { Element, ElementContent, Properties } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import { isElement, isText } from '../utils';

interface ContentRange {
  child: ElementContent;
  index: number;
  start: number;
  end: number;
}

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

function cloneProperties(properties: Properties): Properties {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      Array.isArray(value) ? [...value] : value,
    ]),
  );
}

function cloneElementWithChildren(
  element: Element,
  children: Array<ElementContent>,
): Element {
  const { data, position: _position, ...rest } = element;

  return {
    ...rest,
    data: data ? { ...data } : undefined,
    properties: cloneProperties(element.properties),
    children,
  };
}

export function getContentLength(child: ElementContent) {
  if (isText(child)) {
    return child.value.length;
  }

  if (isElement(child)) {
    return hastToString(child).length;
  }

  return 0;
}

export function splitContentAt(
  child: ElementContent,
  offset: number,
): [ElementContent | undefined, ElementContent | undefined] {
  if (isText(child)) {
    return [
      { ...child, value: child.value.slice(0, offset) },
      { ...child, value: child.value.slice(offset) },
    ];
  }

  if (isElement(child)) {
    return splitElementAt(child, offset);
  }

  return offset <= 0 ? [undefined, child] : [child, undefined];
}

function pushContent(
  children: Array<ElementContent>,
  child: ElementContent | undefined,
) {
  if (child) {
    children.push(child);
  }
}

function splitElementAt(
  element: Element,
  offset: number,
): [Element | undefined, Element | undefined] {
  const contentLength = hastToString(element).length;

  if (offset <= 0) {
    return [undefined, element];
  }

  if (offset >= contentLength) {
    return [element, undefined];
  }

  const leftChildren: Array<ElementContent> = [];
  const rightChildren: Array<ElementContent> = [];
  let remaining = offset;

  for (const child of element.children) {
    if (remaining === 0) {
      rightChildren.push(child);
      continue;
    }

    const childLength = getContentLength(child);

    if (childLength <= remaining) {
      leftChildren.push(child);
      remaining -= childLength;
      continue;
    }

    const [left, right] = splitContentAt(child, remaining);
    pushContent(leftChildren, left);
    pushContent(rightChildren, right);
    remaining = 0;
  }

  return [
    cloneElementWithChildren(element, leftChildren),
    cloneElementWithChildren(element, rightChildren),
  ];
}

function getContentRanges(element: Element, end: number): Array<ContentRange> {
  let offset = 0;
  const ranges: Array<ContentRange> = [];

  for (let index = 0; index < element.children.length; index++) {
    const child = element.children[index];
    const start = offset;
    offset += getContentLength(child);
    ranges.push({ child, index, start, end: offset });

    if (offset >= end) {
      break;
    }
  }

  return ranges;
}

function canSplitToken(element: Element) {
  return (
    element.children.length === 1 &&
    isText(element.children[0]) &&
    Object.keys(element.properties).every((key) => key === 'style')
  );
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

function splitSingleElement(
  parent: Element,
  element: Element,
  start: number,
  end: number,
): Array<Element> {
  if (start === 0 && end === hastToString(element).length) {
    return [element];
  }

  const [before, fromMatch] = splitElementAt(element, start);
  if (!fromMatch) {
    return [];
  }

  const [matching, after] = splitElementAt(fromMatch, end - start);
  if (!matching) {
    return [];
  }

  const replacements = [before, matching, after].filter(isElement);
  parent.children.splice(parent.children.indexOf(element), 1, ...replacements);
  return [matching];
}

function splitBoundaryElements(
  parent: Element,
  first: ContentRange & { child: Element },
  last: ContentRange & { child: Element },
  start: number,
  end: number,
): Array<Element> {
  let firstMatch = first.child;
  let lastMatch = last.child;
  const firstOffset = start - first.start;
  const lastOffset = end - last.start;

  if (firstOffset > 0) {
    const [before, matching] = splitElementAt(first.child, firstOffset);
    if (!(before && matching)) {
      return [];
    }

    const firstIndex = parent.children.indexOf(first.child);
    parent.children.splice(firstIndex, 1, before, matching);
    firstMatch = matching;
  }

  if (lastOffset < last.end - last.start) {
    const [matching, after] = splitElementAt(last.child, lastOffset);
    if (!(matching && after)) {
      return [];
    }

    const lastIndex = parent.children.indexOf(last.child);
    parent.children.splice(lastIndex, 1, matching, after);
    lastMatch = matching;
  }

  const firstIndex = parent.children.indexOf(firstMatch);
  const lastIndex = parent.children.indexOf(lastMatch);
  return parent.children.slice(firstIndex, lastIndex + 1).filter(isElement);
}

function getSingleTarget(
  element: Element,
  range: ContentRange,
  start: number,
  end: number,
): HighlightTarget {
  if (isElement(range.child) && canSplitToken(range.child)) {
    return {
      type: 'elements',
      parent: element,
      elements: splitSingleElement(
        element,
        range.child,
        start - range.start,
        end - range.start,
      ),
    };
  }

  if (isElement(range.child)) {
    const nestedRange = findTextRange(
      range.child,
      start - range.start,
      end - range.start,
    );
    if (nestedRange) {
      return nestedRange;
    }

    return {
      type: 'elements',
      parent: element,
      elements: splitSingleElement(
        element,
        range.child,
        start - range.start,
        end - range.start,
      ),
    };
  }

  return {
    type: 'range',
    parent: element,
    childIndex: range.index,
    start: start - range.start,
    end: end - range.start,
  };
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
    isElement(first.child) &&
    isElement(last.child) &&
    selectedChildren.every(isElement)
  ) {
    return {
      type: 'elements',
      parent: element,
      elements: splitBoundaryElements(
        element,
        { ...first, child: first.child },
        { ...last, child: last.child },
        start,
        end,
      ),
    };
  }

  return undefined;
}

export function getElementsToHighlight(
  element: Element,
  start: number,
  end: number,
): HighlightTarget | undefined {
  const ranges = getContentRanges(element, end);
  const first = ranges.find(
    (range) => range.start <= start && start < range.end,
  );
  const last = ranges.find((range) => range.start < end && end <= range.end);

  if (!(first && last)) {
    return undefined;
  }

  if (first === last) {
    return getSingleTarget(element, first, start, end);
  }

  return getMultipleTarget(element, first, last, start, end);
}
