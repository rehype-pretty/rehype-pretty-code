import {Highlighter} from 'shiki';

type Theme = JSON | string;

export type Options = {
  theme: Theme | Record<any, Theme>;
  keepBackground: boolean;
  tokensMap: {[key: string]: string};
  filterMetaString: (string: string) => string;
  // TODO: strict types
  onVisitLine(node: any): void;
  onVisitHighlightedLine(node: any): void;
  onVisitHighlightedWord(node: any, id: string | undefined): void;
  getHighlighter: (options: Pick<Options, 'theme'>) => Promise<Highlighter>;
};

declare const rehypePrettyCode: (options?: Partial<Options>) => any;

export default rehypePrettyCode;
