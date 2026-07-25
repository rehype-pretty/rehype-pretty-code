import type { Element } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import {
  getContentLength,
  getElementsToHighlight,
} from './getElementsToHighlight';
import {
  wrapHighlightedChars,
  wrapHighlightedCharsInRange,
} from './wrapHighlightedChars';

interface SelectedMatch {
  chars: string;
  start: number;
  end: number;
  element?: CharsElement;
}

interface MatchComponent {
  firstIndex: number;
  lastIndex: number;
  start: number;
  matches: Array<SelectedMatch>;
}

function isAvailable(occupied: Uint8Array, start: number, end: number) {
  for (let index = start; index < end; index++) {
    if (occupied[index] === 1) {
      return false;
    }
  }

  return true;
}

function findMatches(
  source: string,
  chars: string,
  charsIndex: number,
  occupied: Uint8Array,
  options: CharsHighlighterOptions,
): Array<SelectedMatch> {
  const selectedMatches: Array<SelectedMatch> = [];
  const currentRange = options.ranges[charsIndex] || [];
  const counterId = `${chars}-${charsIndex}`;
  let searchStart = 0;

  while (searchStart <= source.length - chars.length) {
    const matchStart = source.indexOf(chars, searchStart);
    if (matchStart === -1) {
      break;
    }

    const matchEnd = matchStart + chars.length;
    if (!isAvailable(occupied, matchStart, matchEnd)) {
      searchStart = matchStart + 1;
      continue;
    }

    const occurrence = (options.counterMap.get(counterId) || 0) + 1;
    options.counterMap.set(counterId, occurrence);
    occupied.fill(1, matchStart, matchEnd);

    if (currentRange.length === 0 || currentRange.includes(occurrence)) {
      selectedMatches.push({ chars, start: matchStart, end: matchEnd });
    }

    searchStart = matchEnd;
  }

  return selectedMatches;
}

function createMatchComponents(
  element: Element,
  selectedMatches: Array<SelectedMatch>,
) {
  const ends: Array<number> = [];
  let offset = 0;

  for (const child of element.children) {
    offset += getContentLength(child);
    ends.push(offset);
  }

  const components: Array<MatchComponent> = [];
  const matchesByPosition = [...selectedMatches].sort(
    (first, second) => first.start - second.start,
  );
  let firstIndex = 0;
  let lastIndex = 0;

  for (const match of matchesByPosition) {
    while (
      firstIndex < element.children.length &&
      ends[firstIndex] <= match.start
    ) {
      firstIndex++;
    }

    lastIndex = Math.max(lastIndex, firstIndex);
    while (lastIndex < element.children.length && ends[lastIndex] < match.end) {
      lastIndex++;
    }

    const previous = components.at(-1);
    if (previous && firstIndex <= previous.lastIndex) {
      previous.lastIndex = Math.max(previous.lastIndex, lastIndex);
      previous.matches.push(match);
    } else {
      components.push({
        firstIndex,
        lastIndex,
        start: firstIndex === 0 ? 0 : ends[firstIndex - 1],
        matches: [match],
      });
    }
  }

  return components;
}

function applyMatches(
  element: Element,
  selectedMatches: Array<SelectedMatch>,
  options: CharsHighlighterOptions,
) {
  const components = createMatchComponents(element, selectedMatches);

  for (
    let componentIndex = components.length - 1;
    componentIndex >= 0;
    componentIndex--
  ) {
    const component = components[componentIndex];
    const container: Element = {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: element.children.slice(
        component.firstIndex,
        component.lastIndex + 1,
      ),
    };

    for (let index = component.matches.length - 1; index >= 0; index--) {
      const match = component.matches[index];
      const target = getElementsToHighlight(
        container,
        match.start - component.start,
        match.end - component.start,
      );
      if (!target) {
        continue;
      }

      if (target.type === 'elements') {
        match.element = wrapHighlightedChars(
          target.parent,
          target.elements,
          match.chars,
          options,
        );
      } else {
        match.element = wrapHighlightedCharsInRange(
          target.parent,
          target.childIndex,
          target.start,
          target.end,
          match.chars,
          options,
        );
      }
    }

    element.children.splice(
      component.firstIndex,
      component.lastIndex - component.firstIndex + 1,
      ...container.children,
    );
  }
}

/**
 * Finds each requested string in the line, then applies the selected matches
 * without materializing range-excluded occurrences.
 */
export function charsHighlighter(
  element: Element,
  charsList: Array<string>,
  options: CharsHighlighterOptions,
  onVisitHighlightedChars?: (
    element: CharsElement,
    id: string | undefined,
  ) => void,
) {
  const source = hastToString(element);
  const occupied = new Uint8Array(source.length);
  const selectedMatches: Array<SelectedMatch> = [];

  charsList.forEach((chars, charsIndex) => {
    if (!chars) {
      return;
    }

    selectedMatches.push(
      ...findMatches(source, chars, charsIndex, occupied, options),
    );
  });

  applyMatches(element, selectedMatches, options);

  for (const match of selectedMatches) {
    if (match.element) {
      onVisitHighlightedChars?.(match.element, options.idsMap.get(match.chars));
    }
  }
}
