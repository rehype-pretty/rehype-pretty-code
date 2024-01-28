import type { Theme } from './types';
import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import type { ThemeRegistrationRaw } from 'shiki';
import rangeParser from 'parse-numeric-range';

export function isJSONTheme(value: any): value is ThemeRegistrationRaw {
  return value ? Object.hasOwn(value, 'tokenColors') : false;
}

export function isElement(
  value: ElementContent | Element | Root | RootContent | null | undefined,
): value is Element {
  return value ? value.type === 'element' : false;
}

export function isText(value: ElementContent | null): value is Text {
  return value ? value.type === 'text' : false;
}

export function isInlineCode(
  element: Element,
  parent: Element | Root | undefined,
): element is Element {
  return (
    (element.tagName === 'code' &&
      isElement(parent) &&
      parent.tagName !== 'pre') ||
    element.tagName === 'inlineCode'
  );
}

export function isBlockCode(element: Element): element is Element {
  return (
    element.tagName === 'pre' &&
    Array.isArray(element.children) &&
    element.children.length === 1 &&
    isElement(element.children[0]) &&
    element.children[0].tagName === 'code'
  );
}

export function getInlineCodeLang(meta: string, defaultFallbackLang: string) {
  const placeholder = '\u0000';
  let temp = meta.replace(/\\\\/g, placeholder);
  temp = temp.replace(/\\({:[a-zA-Z.-]+})$/, '$1');
  const lang = temp.match(/{:([a-zA-Z.-]+)}$/)?.[1];
  return (
    lang?.replace(new RegExp(placeholder, 'g'), '\\') || defaultFallbackLang
  );
}

export function parseBlockMetaString(
  element: Element,
  filter: (s: string) => string,
  defaultFallback: string,
) {
  let meta = filter(
    (element.data?.meta ?? element.properties?.metastring ?? '') as string,
  );

  const titleMatch = meta.match(/title="([^"]*)"/);
  const title = titleMatch?.[1] ?? null;
  meta = meta.replace(titleMatch?.[0] ?? '', '');

  const captionMatch = meta.match(/caption="([^"]*)"/);
  const caption = captionMatch?.[1] ?? null;
  meta = meta.replace(captionMatch?.[0] ?? '', '');

  let lang = defaultFallback;
  if (
    element.properties &&
    Array.isArray(element.properties.className) &&
    typeof element.properties.className[0] === 'string' &&
    element.properties.className[0].startsWith('language-')
  ) {
    lang = element.properties.className[0].replace('language-', '');
  }

  return {
    title,
    caption,
    lang,
    meta,
  };
}

export function getThemeNames(theme: Theme | Record<string, Theme>) {
  if (isJSONTheme(theme)) {
    return [theme.name];
  }
  if (typeof theme === 'string') {
    return [theme];
  }
  return Object.values(theme).map((theme) =>
    typeof theme === 'string' ? theme : theme.name,
  );
}

export function replaceLineClass(element: Element) {
  if (
    Array.isArray(element.properties?.className) &&
    element.properties.className.includes('line')
  ) {
    const className = element.properties.className.filter((c) => c !== 'line');
    element.properties.className = className.length > 0 ? className : undefined;
    element.properties['data-line'] = '';
  }
}

export function getLineId(lineNumber: number, meta: string) {
  const segments = meta.match(/\{[^}]+\}#[a-zA-Z0-9]+/g);
  if (!segments) return null;

  for (const segment of segments) {
    const [range, id] = segment.split('#');
    if (!range || !id) continue;

    const match = range.match(/\{(.*?)\}/);
    const capture = match?.[1];

    if (capture && rangeParser(capture).includes(lineNumber)) {
      return id;
    }
  }

  return null;
}
