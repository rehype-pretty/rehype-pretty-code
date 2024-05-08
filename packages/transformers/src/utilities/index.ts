/**
 * matches and removes leading and trailing whitespace and newlines
 */
const whitespaceRegEx = /\s*\n\s*/g;

export const trimWhitespace = (input: string) =>
  input.replaceAll(whitespaceRegEx, '').trim();
