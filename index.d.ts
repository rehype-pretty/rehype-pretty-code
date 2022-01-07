type theme = JSON | string;

export type Options = {
  theme: theme | Record<any, theme>;
  tokensMap: {[key: string]: string};
  // TODO: strict types
  onVisitLine(node: any): void;
  onVisitHighlightedLine(node: any): void;
  onVisitHighlightedWord(node: any): void;
};

declare const prettyCode: (options?: Partial<Options>) => any;

export {prettyCode};
