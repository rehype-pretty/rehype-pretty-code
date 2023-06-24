import type { Highlighter, IShikiTheme } from 'shiki';
import type { Transformer } from 'unified';
import type { Root, Element, Properties } from 'hast';

export type LineElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};

export type CharsElement = Omit<Element, 'properties' | 'children'> & {
  properties: Properties & { className?: string[] };
  children: Array<Element | Text>;
};

type Theme = IShikiTheme | string;

export interface Options {
  grid?: boolean;
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  tokensMap?: Record<string, string>;
  filterMetaString?(str: string): string;
  getHighlighter?(options: Pick<Options, 'theme'>): Promise<Highlighter>;
  onVisitLine?(element: LineElement): void;
  onVisitHighlightedLine?(element: LineElement): void;
  onVisitHighlightedChars?(element: CharsElement, id: string | undefined): void;
  onVisitTitle?(element: Element): void;
  onVisitCaption?(element: Element): void;
}

export default function rehypePrettyCode(
  options?: void | Options | undefined
): void | Transformer<Root, Root>;
