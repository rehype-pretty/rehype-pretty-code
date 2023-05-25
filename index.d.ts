import type {Highlighter} from 'shiki';
import type {Transformer, Node} from 'unified';

type Theme = JSON | string;

export interface Options {
  theme: Theme | Record<string, Theme>;
  keepBackground: boolean;
  tokensMap: Record<string, string>;
  filterMetaString: (str: string) => string;
  onVisitLine(node: Node): void;
  onVisitHighlightedLine(node: Node): void;
  onVisitHighlightedWord(node: Node, id: string | undefined): void;
  getHighlighter: (options: Pick<Options, 'theme'>) => Promise<Highlighter>;
}

declare const rehypePrettyCode: (
  options?: Partial<Options>
) => Transformer<Root, Root>;

export default rehypePrettyCode;
