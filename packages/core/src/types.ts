import type {
  BundledHighlighterOptions,
  Highlighter,
  BuiltinTheme,
  ThemeRegistrationRaw,
  ShikiTransformer,
  createHighlighter,
} from 'shiki';
import type { Element, Properties, Text } from 'hast';

export type ShikiHighlighterOptions = Parameters<typeof createHighlighter>[0];

export type LineElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: Array<string> };
};

export type CharsElement = Omit<Element, 'properties' | 'children'> & {
  properties: Properties & { className?: Array<string> };
  children: Array<Element | Text>;
};

export type Theme = BuiltinTheme | ThemeRegistrationRaw;

export type { Options as RehypePrettyCodeOptions };

export interface Options {
  grid?: boolean;
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  bypassInlineCode?: boolean;
  defaultLang?: string | { block?: string; inline?: string };
  tokensMap?: Record<string, string>;
  transformers?: Array<ShikiTransformer>;
  filterMetaString?(str: string): string;
  getHighlighter?(
    options: BundledHighlighterOptions<any, any>,
  ): Promise<Highlighter>;
  onVisitLine?(element: LineElement): void;
  onVisitHighlightedLine?(element: LineElement, id: string | undefined): void;
  onVisitHighlightedChars?(element: CharsElement, id: string | undefined): void;
  onVisitTitle?(element: Element): void;
  onVisitCaption?(element: Element): void;
}

export interface CharsHighlighterOptions {
  ranges: Array<Array<number>>;
  idsMap: Map<string, string>;
  counterMap: Map<string, number>;
}
