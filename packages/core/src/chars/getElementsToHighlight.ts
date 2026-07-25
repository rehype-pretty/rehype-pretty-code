import type { Element } from 'hast';
import { splitElement } from './splitElement';
import {
  findOverlap,
  getContent,
  nextElementMaybeContinuesChars,
} from './utils';

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export function getElementsToHighlight(
  element: Element,
  chars: string,
  startIndex = 0,
): Array<{ element: Element; index: number }> {
  const toWrap = [];
  let charsSoFar = '';

  if (element.children) {
    const elements = element.children as Array<Element>;

    // `wrapHighlightedChars` replaces `toWrap.length` consecutive siblings
    // starting at the first index, so a run collected across a gap would
    // splice out nodes it never matched. Drop a partial run the moment it
    // stops being contiguous.
    const discardRun = () => {
      toWrap.length = 0;
      charsSoFar = '';
    };

    for (let i = startIndex; i < elements.length; i++) {
      const remaining = charsSoFar ? chars.replace(charsSoFar, '') : chars;

      if (remaining === '') {
        return toWrap;
      }

      const maybeElement = elements[i];

      if (
        !maybeElement ||
        maybeElement.type !== 'element' ||
        // ignore any previously matched chars within
        Object.hasOwn(
          maybeElement.properties ?? {},
          'rehype-pretty-code-visited',
        )
      ) {
        // This node cannot take part in the run, so it separates whatever
        // preceded it from whatever follows.
        discardRun();
        continue;
      }

      // How much had been collected before this node was considered, so the
      // end of the loop body can tell whether the node joined the run.
      const collectedBefore = toWrap.length;
      const content = getContent(maybeElement) || '';

      // node is the chars, or it finishes the chars
      if (
        charsSoFar === '' ? content === chars : charsSoFar + content === chars
      ) {
        toWrap.push({ element: maybeElement, index: i });
        return toWrap;
      }

      // check if the whole node is a continuation of the chars
      if (chars.startsWith(charsSoFar + content)) {
        // make sure we continue here only if further siblings
        // complete the chars. Otherwise an earlier repetition
        // of a section of the chars will lead us down the wrong path
        if (
          nextElementMaybeContinuesChars({
            elements,
            nextIndex: i + 1,
            remainingPart: remaining.replace(content, ''),
          })
        ) {
          toWrap.push({ element: elements[i], index: i });
          charsSoFar += content;
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
          getContent(elements[i + 1]) &&
          !nextElementMaybeContinuesChars({
            elements,
            nextIndex: i + 1,
            remainingPart: nextPart,
          })
        ) {
          if (collectedBefore > 0) {
            // Give up on the run, then reconsider this node from scratch: it
            // may still be the start of a fresh one.
            discardRun();
            i--;
          }
          continue;
        }

        const splitParts = content.split(overlap);
        const [leftPart, rightPart, ...rest] = splitParts;

        if (rightPart || leftPart || rest.length > 0) {
          // One of the below scenarios should be true
          // 1. the whole set of chars are inside the string (at least once) ca[rro]t
          // 2. the chars finish or start & end on the beginning of the string ...[carr]ot
          // 3. the chars start or start & end from the end of the string carr[ot]...

          const withNextNode =
            content +
            (getContent(elements[i + 1]) ? getContent(elements[i + 1]) : '');
          const nextNodeOverlap = findOverlap(withNextNode, remaining);
          const splitIndex = withNextNode.indexOf(nextNodeOverlap);

          if (chars.endsWith(overlap) || chars.startsWith(overlap)) {
            const rightString = rightPart.replace(overlap, '');
            const innerString = overlap;
            const leftString = content.substring(0, splitIndex);

            // need to check this to avoid edge case where the right
            // side will be duplicated when the matched part repeats within the
            // current node
            const nextElementContinues = nextElementMaybeContinuesChars({
              elements,
              nextIndex: i + 1,
              remainingPart: nextPart,
            });

            const [newElement, updatedIndex] = splitElement({
              elements,
              elementToWrap: elements[i],
              innerString,
              rightString,
              leftString,
              rest,
              nextElementContinues,
              index: i,
            });

            charsSoFar += overlap;

            toWrap.push({
              element: newElement,
              index: updatedIndex,
            });
          }
        }
      }

      if (collectedBefore > 0 && toWrap.length === collectedBefore) {
        // The node contributed nothing, so the chars are not spelled by an
        // unbroken run of siblings ending here. Start over from this node.
        discardRun();
        i--;
      }
    }
  }

  return toWrap;
}
