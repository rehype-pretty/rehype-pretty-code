import {wrapHighlightedWords} from './wrapHighlightedWords';
import {getNodesToHighlight} from './getNodesToHighlight';
import {toString} from 'hast-util-to-string';

// Loops through the child nodes and finds the nodes that make up the word.

// If the word crosses node boundaries, those nodes are wrapped
// with <span data-rehype-pretty-code-wrapper/>,
// and that node is passed to onVisitHighlightedWord.

// If a node partially matches the word,
// its content is replaced with the matched part, and the
// left and/or right parts are cloned to sibling nodes

export function wordHighlighter(node, word, options, onVisitHighlightedWord) {
  if (!word || !Array.isArray(word)) return;
  const {wordNumbers = [], wordCounter} = options;
  const textContent = toString(node);

  word.forEach((word, index) => {
    if (word && textContent?.includes(word)) {
      options.wordCounter = wordCounter + 1;
      if (
        wordNumbers.length === 0 ||
        wordNumbers[index]?.includes(options.wordCounter) ||
        wordNumbers[index]?.length === 0
      ) {
        let textContent = toString(node);
        let startIndex = 0;

        while (textContent.includes(word)) {
          const nodesToWrap = getNodesToHighlight(node, word, startIndex);

          // maybe throw / notify due to failure here
          if (nodesToWrap.length === 0) break;

          wrapHighlightedWords(
            node,
            nodesToWrap,
            options,
            onVisitHighlightedWord
          );

          // re-start from the 'last' node (the word or part of it may exist multiple times in the same node)
          // account for possible extra nodes added from split with - 2
          startIndex = Math.max(
            nodesToWrap[nodesToWrap.length - 1].index - 2,
            0
          );
          textContent = node.children
            ?.map((childNode) => {
              if (
                !childNode.properties.hasOwnProperty(
                  'rehype-pretty-code-visited'
                ) &&
                !childNode.properties.hasOwnProperty(
                  'data-rehype-pretty-code-wrapper'
                )
              ) {
                return toString(childNode);
              }
            })
            .join('');
        }

        node.children?.forEach((childNode) => {
          if (
            childNode.properties.hasOwnProperty('rehype-pretty-code-visited')
          ) {
            delete childNode.properties['rehype-pretty-code-visited'];
          }
        });
      }
    }
  });
}
