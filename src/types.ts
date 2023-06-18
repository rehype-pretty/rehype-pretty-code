import type { Properties, Element } from 'hast';

export interface WordHighlighterOptions {
  wordNumbers: Array<number[]>;
  wordIdsMap: Map<string, string>;
  wordCounter: Map<string, number>;
}

export type VisitableElement = Omit<Element, 'properties'> & {
  properties: Properties & { className?: string[] };
};
