interface shikiOptions {
  [key: string]: any;
}
interface shikiOptionsWithTheme extends shikiOptions {
  theme: JSON | string;
  themes?: never;
}
interface shikiOptionsWithThemes extends shikiOptions {
  themes: (JSON | string)[];
  theme?: never;
}

export type Options = {
  sanitizeOptions: any;
  shikiOptions: shikiOptionsWithTheme | shikiOptionsWithThemes;
  tokensMap: {[key: string]: string};
  onVisitLine(node: Element): void;
  onVisitHighlightedLine(node: Element): void;
  onVisitHighlightedWord(node: Element): void;
  ignoreUnknownLanguage: boolean;
};

declare const createRemarkPlugin: (options?: Partial<Options>) => any;

export {createRemarkPlugin};
