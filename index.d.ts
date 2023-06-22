import type { Highlighter, IShikiTheme } from 'shiki';
import type { Transformer } from 'unified';
import type { Root, Element } from 'hast';

export type VisitableElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};

type Theme = IShikiTheme | string;

export interface Options {
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  tokensMap?: Record<string, string>;
  filterMetaString?(str: string): string;
  onVisitLine?(element: VisitableElement): void;
  onVisitHighlightedLine?(element: VisitableElement): void;
  onVisitHighlightedWord?(
    element: VisitableElement,
    id: string | undefined
  ): void;
  getHighlighter?(options: Pick<Options, 'theme'>): Promise<Highlighter>;
}

export default function rehypePrettyCode(
  options?: void | Options | undefined
): void | Transformer<Root, Root>;
