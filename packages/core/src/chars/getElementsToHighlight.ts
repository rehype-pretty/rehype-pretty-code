import type { Element, ElementContent } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import { isElement, isText } from '../utils';

interface RunElement {
  element: Element;
  content: string;
  start: number;
  end: number;
}

interface Match {
  first: RunElement;
  last: RunElement;
  firstOffset: number;
  lastOffset: number;
}

function cloneElementWithChildren(
  element: Element,
  children: Array<ElementContent>,
): Element {
  return {
    ...element,
    properties: { ...element.properties },
    children,
  };
}

function splitContentAt(
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

  return [child, undefined];
}

function getContentLength(child: ElementContent) {
  if (isText(child)) {
    return child.value.length;
  }

  if (isElement(child)) {
    return hastToString(child).length;
  }

  return 0;
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

function createMatch(
  run: Array<RunElement>,
  matchStart: number,
  matchLength: number,
): Match | undefined {
  const matchEnd = matchStart + matchLength;
  const first = run.find(
    ({ start, end }) => start <= matchStart && matchStart < end,
  );
  const last = run.find(
    ({ start, end }) => start < matchEnd && matchEnd <= end,
  );

  if (!(first && last)) {
    return undefined;
  }

  return {
    first,
    last,
    firstOffset: matchStart - first.start,
    lastOffset: matchEnd - last.start,
  };
}

function splitSingleElement(
  elements: Array<Element>,
  match: Match,
): Array<Element> {
  const { first, firstOffset, lastOffset } = match;

  if (firstOffset === 0 && lastOffset === first.content.length) {
    return [first.element];
  }

  const [before, fromMatch] = splitElementAt(first.element, firstOffset);

  if (!fromMatch) {
    return [];
  }

  const [matching, after] = splitElementAt(fromMatch, lastOffset - firstOffset);

  if (!matching) {
    return [];
  }

  const replacements = [before, matching, after].filter(isElement);
  elements.splice(elements.indexOf(first.element), 1, ...replacements);
  return [matching];
}

function splitBoundaryElements(
  elements: Array<Element>,
  match: Match,
): Array<Element> {
  const { first, last, firstOffset, lastOffset } = match;
  let firstMatch = first.element;
  let lastMatch = last.element;

  if (firstOffset > 0) {
    const [before, matching] = splitElementAt(first.element, firstOffset);

    if (!(before && matching)) {
      return [];
    }

    const firstIndex = elements.indexOf(first.element);
    elements.splice(firstIndex, 1, before, matching);
    firstMatch = matching;
  }

  if (lastOffset < last.content.length) {
    const [matching, after] = splitElementAt(last.element, lastOffset);

    if (!(matching && after)) {
      return [];
    }

    const lastIndex = elements.indexOf(last.element);
    elements.splice(lastIndex, 1, matching, after);
    lastMatch = matching;
  }

  const firstIndex = elements.indexOf(firstMatch);
  const lastIndex = elements.indexOf(lastMatch);
  return elements.slice(firstIndex, lastIndex + 1);
}

function splitMatch(elements: Array<Element>, match: Match): Array<Element> {
  if (match.first === match.last) {
    return splitSingleElement(elements, match);
  }

  return splitBoundaryElements(elements, match);
}

function findMatchInRun(
  elements: Array<Element>,
  run: Array<RunElement>,
  matchStart: number,
  matchLength: number,
): Array<Element> {
  const match = createMatch(run, matchStart, matchLength);

  if (!match) {
    return [];
  }

  return splitMatch(elements, match);
}

export function getElementsToHighlight(
  element: Element,
  chars: string,
  startIndex = 0,
): Array<Element> {
  if (chars === '') {
    return [];
  }

  const elements = element.children as Array<Element>;
  let run: Array<RunElement> = [];
  let runLength = 0;
  let tail = '';

  for (let i = startIndex; i <= elements.length; i++) {
    const maybeElement = elements[i];
    const isAvailable =
      maybeElement?.type === 'element' &&
      !Object.hasOwn(
        maybeElement.properties ?? {},
        'rehype-pretty-code-visited',
      );

    if (isAvailable) {
      const content = hastToString(maybeElement);
      const window = tail + content;
      const localMatchStart = window.indexOf(chars);

      run.push({
        element: maybeElement,
        content,
        start: runLength,
        end: runLength + content.length,
      });

      if (localMatchStart !== -1) {
        const matchStart = runLength - tail.length + localMatchStart;
        return findMatchInRun(elements, run, matchStart, chars.length);
      }

      runLength += content.length;
      tail = chars.length > 1 ? window.slice(1 - chars.length) : '';
      continue;
    }

    run = [];
    runLength = 0;
    tail = '';
  }

  return [];
}
