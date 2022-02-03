import {toString} from 'hast-util-to-string';

// look ahead to determine if further
// sibling nodes continue the string
export function nextNodeMaybeContinuesWord({nodes, nextIndex, remainingPart}) {
  if (remainingPart === '') return false;
  const nextNode = nodes[nextIndex];
  const content = getContent(nextNode);
  if (!content) return;

  const includesNext =
    content.startsWith(remainingPart) || remainingPart.startsWith(content);

  const overlap = findOverlap(content, remainingPart);

  if (overlap === remainingPart && content.startsWith(remainingPart)) {
    return true;
  }

  if (includesNext) {
    return nextNodeMaybeContinuesWord({
      nodes,
      nextIndex: nextIndex + 1,
      remainingPart: remainingPart.replace(content, ''),
    });
  } else {
    return false;
  }
}

export function getContent(node) {
  if (!node) return;
  return toString(node);
}

export function findOverlap(a, b) {
  if (b.length === 0) {
    return '';
  }

  if (a.endsWith(b)) {
    return b;
  }

  if (a.indexOf(b) >= 0) {
    return b;
  }

  return findOverlap(a, b.substring(0, b.length - 1));
}
