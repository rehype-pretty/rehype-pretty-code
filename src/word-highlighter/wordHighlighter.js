import { getNodesToHighlight } from './getNodesToHighlight';
import { wrapHighlightedWords } from './wrapHighlightedWords';
import { toString } from 'hast-util-to-string';

// Loops through the child nodes and finds the nodes that make up the word.

// If the word crosses node boundaries, those nodes are wrapped
// with <span data-rehype-pretty-code-wrapper/>,
// and that node is passed to onVisitHighlightedWord.

// If a node partially matches the word,
// its content is replaced with the matched part, and the
// left and/or right parts are cloned to sibling nodes

export function wordHighlighter(node, words, options, onVisitHighlightedWord) {
  if (!words || !Array.isArray(words)) return;
  const { wordNumbers = [] } = options;
  const textContent = toString(node);

  words.forEach((word, index) => {
    if (word && textContent?.includes(word)) {
      let textContent = toString(node);
      let startIndex = 0;

      while (textContent.includes(word)) {
        const currentWordRange = wordNumbers[index] || [];
        const id = `${word}-${index}`;
        options.wordCounter.set(id, (options.wordCounter.get(id) || 0) + 1);

        const ignoreWord =
          currentWordRange.length > 0 &&
          !currentWordRange.includes(options.wordCounter.get(id));

        const nodesToWrap = getNodesToHighlight(
          node,
          word,
          startIndex,
          ignoreWord,
        );

        // maybe throw / notify due to failure here
        if (nodesToWrap.length === 0) break;

        wrapHighlightedWords(
          node,
          nodesToWrap,
          options,
          ignoreWord,
          onVisitHighlightedWord,
        );
        // re-start from the 'last' node (the word or part of it may exist multiple times in the same node)
        // account for possible extra nodes added from split with - 2
        startIndex = Math.max(nodesToWrap[nodesToWrap.length - 1].index - 2, 0);
        textContent = node.children
          ?.map((childNode) => {
            if (
              !Object.hasOwn(
                childNode.properties,
                'rehype-pretty-code-visited',
              ) &&
              !Object.hasOwn(
                childNode.properties,
                'data-rehype-pretty-code-wrapper',
              )
            ) {
              return toString(childNode);
            }
          })
          .join('');
      }
    }

    node.children?.forEach((childNode) => {
      if (Object.hasOwn(childNode.properties, 'rehype-pretty-code-visited')) {
        childNode.properties['rehype-pretty-code-visited'] = undefined;
      }
    });
  });
}
