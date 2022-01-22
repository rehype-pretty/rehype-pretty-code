import {Highlighter} from 'shiki';

type theme = JSON | string;

export type Options = {
  theme: theme | Record<any, theme>;
  tokensMap: {[key: string]: string};
  // TODO: strict types
  onVisitLine(node: any): void;
  onVisitHighlightedLine(node: any): void;
  onVisitHighlightedWord(node: any): void;
  getHighlighter?: (options: Pick<Options, 'theme'>) => Highlighter;
};

declare const rehypePrettyCode: (options?: Partial<Options>) => any;

export default rehypePrettyCode;
