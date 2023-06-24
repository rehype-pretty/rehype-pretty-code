import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import type { IShikiTheme } from 'shiki';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isShikiTheme(value: any): value is IShikiTheme {
  return value ? hasOwnProperty(value, 'tokenColors') : false;
}

export function isElement(
  value: ElementContent | Element | Root | RootContent | null
): value is Element {
  return value ? value.type === 'element' : false;
}

export function isText(value: ElementContent | null): value is Text {
  return value ? value.type === 'text' : false;
}

export function hasOwnProperty(
  object: Record<string, unknown>,
  string: string
) {
  return {}.hasOwnProperty.call(object, string);
}
