import type { Element, Properties, Root } from 'hast';
import type { Highlighter } from 'shiki';
import type { Transformer } from 'unified';

type Theme = JSON | string;

export type VisitableElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};

export interface Options {
  theme?: Theme | Record<string, Theme>;
  keepBackground?: boolean;
  tokensMap?: Record<string, string>;
  filterMetaString?(str: string): string;
  onVisitLine?(element: VisitableElement): void;
  onVisitHighlightedLine?(element: VisitableElement): void;
  onVisitHighlightedWord?(
    element: VisitableElement,
    id: string | undefined,
  ): void;
  getHighlighter?(options: Pick<Options, 'theme'>): Promise<Highlighter>;
}

export default function rehypePrettyCode(
  options?: void | Options | undefined,
): void | Transformer<Root, Root>;
