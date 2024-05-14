/**
 * given an array and a start and end index, return 3 arrays:
 * - the elements before the start index,
 * - the elements between the start and end index, and
 * - the elements after the end index
 */
export function splicer<T>(
  array: Array<T>,
  start: number,
  end: number,
): [Array<T>, Array<T>, Array<T>] {
  return [array.slice(0, start), array.slice(start, end), array.slice(end)];
}

/**
 * matches and removes leading and trailing whitespace and newlines
 */
const whitespaceRegEx = /\s*\n\s*/g;

export const trimWhitespace = (input: string) =>
  input.replaceAll(whitespaceRegEx, '').trim();
