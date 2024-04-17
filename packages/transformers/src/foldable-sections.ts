import type { ShikiTransformer } from 'shiki';

/**
 * TODO
 */

export function foldableSectionsTransformer(): ShikiTransformer {
  return {
    name: '@rehype-pretty/transformers/foldable-sections',
    code(node) {
      return node;
    },
  };
}
