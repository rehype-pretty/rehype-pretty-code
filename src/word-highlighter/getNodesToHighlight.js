import { splitNode } from './splitNode';
import { findOverlap, getContent, nextNodeMaybeContinuesWord } from './utils';

export function getNodesToHighlight(
  node,
  word,
  startIndex = 0,
  ignoreWord = false,
) {
  const toWrap = [];
  let wordSoFar = '';
  if (node.children) {
    const nodes = node.children;
    for (let i = startIndex; i < nodes.length; i++) {
      const remaining = wordSoFar ? word.replace(wordSoFar, '') : word;

      if (remaining === '') return toWrap;

      if (
        !nodes[i] ||
        nodes[i].type !== 'element' ||
        // ignore any previously matched words within
        Object.hasOwn(nodes[i].properties, 'rehype-pretty-code-visited')
      ) {
        continue;
      }

      const content = getContent(nodes[i]);

      // node is the word, or it finishes the word
      if (content === word || wordSoFar + content === word) {
        toWrap.push({ node: nodes[i], index: i });
        return toWrap;
      }

      // check if the whole node is a continuation of the word
      if (word.startsWith(wordSoFar + content)) {
        // make sure we continue here only if further siblings
        // complete the word. Otherwise an earlier repetition
        // of a section of the word will lead us down the wrong path
        if (
          nextNodeMaybeContinuesWord({
            nodes,
            nextIndex: i + 1,
            remainingPart: remaining.replace(content, ''),
          })
        ) {
          toWrap.push({ node: nodes[i], index: i });
          wordSoFar += content;
          continue;
        }
      }

      const overlap = findOverlap(content, remaining);

      const partialMatch = overlap && remaining.startsWith(overlap);

      if (partialMatch) {
        const nextPart = remaining.replace(overlap, '');

        // this is the wrong node, continue
        if (
          nextPart !== '' &&
          getContent(nodes[i + 1]) &&
          !nextNodeMaybeContinuesWord({
            nodes,
            nextIndex: i + 1,
            remainingPart: nextPart,
          })
        ) {
          continue;
        }

        const splitParts = content.split(overlap);
        const [leftPart, rightPart, ...rest] = splitParts;

        if (rightPart || leftPart || rest.length > 0) {
          // One of the below scenarios should be true
          // 1. the whole word is inside the string (at least once) ca[rro]t
          // 2. the word finishes or starts & ends on the beginnning of the string ...[carr]ot
          // 3. the word starts or starts & ends from the end of the string carr[ot]...

          const withNextNode =
            content +
            (getContent(nodes[i + 1]) ? getContent(nodes[i + 1]) : '');
          const nextNodeOverlap = findOverlap(withNextNode, remaining);
          const splitIndex = withNextNode.indexOf(nextNodeOverlap);

          if (word.endsWith(overlap) || word.startsWith(overlap)) {
            const rightString = rightPart.replace(overlap);
            let leftString = '';
            const innerString = overlap;

            leftString = content.substring(0, splitIndex);

            // need to check this to avoid edge case where the right
            // side will be duplicated when the matched part repeats within the current node
            const nextNodeContinues = nextNodeMaybeContinuesWord({
              nodes,
              nextIndex: i + 1,
              remainingPart: nextPart,
            });

            const [newNode, updatedIndex] = splitNode({
              nodes,
              nodeToWrap: nodes[i],
              innerString,
              rightString,
              leftString,
              rest,
              nextNodeContinues,
              index: i,
              ignoreWord,
            });

            wordSoFar += overlap;

            toWrap.push({
              node: newNode,
              index: updatedIndex,
            });
          }
        }
      }
    }
  }
  return toWrap;
}
