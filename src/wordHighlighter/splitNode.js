export function splitNode({
  nodes,
  nodeToWrap,
  innerString,
  rightString,
  leftString,
  rest,
  nextNodeContinues,
  index,
}) {
  if (nodeToWrap?.children?.[0]?.type !== 'text') return [nodeToWrap, index];

  let newIndex = index;

  // assign the matched value to the current node
  nodeToWrap.children[0].value = innerString;

  let rightStr = rightString;
  let leftStr = leftString;

  // append any repetitions to the right if necesary
  if (rest.length > 0) {
    rightStr += rest
      .map((s) => (s === '' ? innerString : innerString + s))
      .join('');
  }

  if (leftStr.length > 0) {
    nodes.splice(newIndex, 0, {
      ...nodeToWrap,
      properties: {...nodeToWrap.properties},
      children: [
        {
          type: 'text',
          value: leftStr,
        },
      ],
    });
  }

  if (rightStr.length > 0 && !nextNodeContinues) {
    newIndex = leftStr.length > 0 ? newIndex + 2 : newIndex + 1;
    nodes.splice(newIndex, 0, {
      ...nodeToWrap,
      properties: {...nodeToWrap.properties},
      children: [
        {
          type: 'text',
          value: rightStr,
        },
      ],
    });
  }

  return [nodeToWrap, index + 1];
}
