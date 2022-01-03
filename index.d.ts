type theme = JSON | string;

export type Options = {
  sanitizeOptions: any;
  shikiOptions: {
    theme: theme | Record<any, theme>;
    [key: string]: any;
  };
  tokensMap: {[key: string]: string};
  onVisitLine(node: Element): void;
  onVisitHighlightedLine(node: Element): void;
  onVisitHighlightedWord(node: Element): void;
  ignoreUnknownLanguage: boolean;
};

declare const createRemarkPlugin: (options?: Partial<Options>) => any;

export {createRemarkPlugin};
