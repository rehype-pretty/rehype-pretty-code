import type {
  BundledHighlighterOptions,
  Highlighter,
  BuiltinTheme,
  ThemeRegistrationRaw,
  ShikijiTransformer,
} from 'shikiji';
import type { Transformer } from 'unified';
import type { Root, Element, Properties } from 'hast';

export type LineElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};

export type CharsElement = Omit<Element, 'properties' | 'children'> & {
  properties: Properties & { className?: string[] };
  children: Array<Element | Text>;
};

type Theme = BuiltinTheme | ThemeRegistrationRaw;

export interface Options {
  grid?: boolean;
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  defaultLang?: string | { block?: string; inline?: string };
  tokensMap?: Record<string, string>;
  transformers?: ShikijiTransformer[];
  filterMetaString?(str: string): string;
  getHighlighter?(options: BundledHighlighterOptions): Promise<Highlighter>;
  onVisitLine?(element: LineElement): void;
  onVisitHighlightedLine?(element: LineElement, id: string | undefined): void;
  onVisitHighlightedChars?(element: CharsElement, id: string | undefined): void;
  onVisitTitle?(element: Element): void;
  onVisitCaption?(element: Element): void;
}

export default function rehypePrettyCode(
  options?: void | Options | undefined,
): void | Transformer<Root, Root>;
