import { isElement, isText } from '../utils';
import { Element } from 'hast';

interface SplitNodeProps {
  nodes: Element[];
  nodeToWrap: Element;
  innerString: string;
  rightString: string;
  leftString: string;
  rest: string[];
  nextNodeContinues: boolean;
  index: number;
  ignoreWord: boolean;
}

export function splitNode({
  nodes,
  nodeToWrap,
  innerString,
  rightString,
  leftString,
  rest,
  nextNodeContinues,
  index,
  ignoreWord,
}: SplitNodeProps) {
  if (
    (isElement(nodeToWrap) && nodeToWrap?.children?.[0]?.type !== 'text') ||
    ignoreWord
  ) {
    return [nodeToWrap, index] as const;
  }

  let newIndex = index;

  // assign the matched value to the current node
  const textElement = nodeToWrap.children[0];
  if (isText(textElement)) {
    textElement.value = innerString;
  }

  let rightStr = rightString;
  const leftStr = leftString;

  // append any repetitions to the right if necesary
  if (rest.length > 0) {
    rightStr += rest
      .map((s) => (s === '' ? innerString : innerString + s))
      .join('');
  }

  if (leftStr.length > 0) {
    nodes.splice(newIndex, 0, {
      ...nodeToWrap,
      properties: { ...nodeToWrap.properties },
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
      properties: { ...nodeToWrap.properties },
      children: [
        {
          type: 'text',
          value: rightStr,
        },
      ],
    });
  }

  return [nodeToWrap, index + 1] as const;
}
