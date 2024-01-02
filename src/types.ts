import type {
  BundledHighlighterOptions,
  Highlighter,
  BuiltinTheme,
  ThemeRegistrationRaw,
  ShikijiTransformer,
} from 'shikiji';
import type { Element, Properties, Text } from 'hast';

export type LineElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};

export type CharsElement = Omit<Element, 'properties' | 'children'> & {
  properties: Properties & { className?: string[] };
  children: Array<Element | Text>;
};

export type Theme = BuiltinTheme | ThemeRegistrationRaw;

export interface Options {
  grid?: boolean;
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  defaultLang?: string | { block?: string; inline?: string };
  tokensMap?: Record<string, string>;
  transformers?: ShikijiTransformer[];
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
  ranges: Array<number[]>;
  idsMap: Map<string, string>;
  counterMap: Map<string, number>;
}
