import type { Element, ElementContent, Root, RootContent, Text } from 'hast';
import type { ThemeRegistrationRaw } from 'shikiji';
import type { Theme } from '..';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isJSONTheme(value: any): value is ThemeRegistrationRaw {
  return value ? hasOwnProperty(value, 'tokenColors') : false;
}

export function isElement(
  value: ElementContent | Element | Root | RootContent | null | undefined,
): value is Element {
  return value ? value.type === 'element' : false;
}

export function isText(value: ElementContent | null): value is Text {
  return value ? value.type === 'text' : false;
}

export function hasOwnProperty(
  object: Record<string, unknown>,
  string: string,
) {
  return {}.hasOwnProperty.call(object, string);
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

export function getInlineCodeLang(meta: string, defaultFallback: string) {
  return meta.match(/{:([a-zA-Z.-]+)}$/)?.[1] || defaultFallback;
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
  } else if (typeof theme === 'string') {
    return [theme];
  } else {
    return Object.values(theme).map((theme) =>
      typeof theme === 'string' ? theme : theme.name,
    );
  }
}
