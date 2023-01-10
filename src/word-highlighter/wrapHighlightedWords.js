export function wrapHighlightedWords(
  parentNode,
  nodesToWrap,
  options,
  ignoreWord,
  onVisitHighlightedWord
) {
  if (!nodesToWrap || nodesToWrap.length === 0) return;
  const [{node}] = nodesToWrap;

  if (ignoreWord) {
    node.properties['rehype-pretty-code-visited'] = '';
    return;
  }

  if (nodesToWrap.length > 1) {
    parentNode.children.splice(nodesToWrap[0].index, nodesToWrap.length, {
      type: 'element',
      tagName: 'span',
      properties: {'data-rehype-pretty-code-wrapper': true},
      children: nodesToWrap.map(({node}) => node),
    });

    const wordStr = parentNode.children[nodesToWrap[0].index].children.reduce(
      (acc, node) => acc + node.children[0].value,
      ''
    );

    onVisitHighlightedWord(
      parentNode.children[nodesToWrap[0].index],
      options.wordIdsMap.get(wordStr)
    );
  } else {
    const [{node}] = nodesToWrap;
    const wordStr = node.children[0].value;
    onVisitHighlightedWord(node, options.wordIdsMap.get(wordStr));
    // used to skip already parsed words
    node.properties['rehype-pretty-code-visited'] = '';
  }
}
