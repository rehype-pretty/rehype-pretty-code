export function wrapHighlightedWords(
  parentNode,
  nodesToWrap,
  onVisitHighlightedWord
) {
  if (!nodesToWrap || nodesToWrap.length === 0) return;
  if (nodesToWrap.length > 1) {
    parentNode.children.splice(nodesToWrap[0].index, nodesToWrap.length, {
      type: 'element',
      tagName: 'span',
      properties: {'data-rehype-pretty-code-wrapper': true},
      children: nodesToWrap.map(({node}) => node),
    });

    onVisitHighlightedWord(parentNode.children[nodesToWrap[0].index]);
  } else {
    const [{node}] = nodesToWrap;
    onVisitHighlightedWord(node);
    // used to skip already parsed words
    node.properties['rehype-pretty-code-visited'] = '';
  }
}
