import type { Element } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { CharsHighlighterOptions, CharsElement } from '../types';
import { getElementsToHighlight } from './getElementsToHighlight';
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

  const matchesToApply = [...selectedMatches].sort(
    (first, second) => second.start - first.start,
  );

  for (const match of matchesToApply) {
    const target = getElementsToHighlight(element, match.start, match.end);
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

  for (const match of selectedMatches) {
    if (match.element) {
      onVisitHighlightedChars?.(match.element, options.idsMap.get(match.chars));
    }
  }
}
