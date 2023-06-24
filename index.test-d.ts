import rehypePrettyCode from './src';
import { unified } from 'unified';

unified().use(rehypePrettyCode, {
  theme: 'one-dark-pro',
  keepBackground: false,
  onVisitLine(element) {
    if (element.children.length === 0) {
      element.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(element) {
    element.properties.className?.push('highlighted');
  },
  onVisitHighlightedChars(element, id) {
    element.properties.className = ['word'];

    if (id) {
      // If the word spans across syntax boundaries (e.g. punctuation), remove
      // colors from the child elements.
      if (element.properties['data-highlighted-chars-wrapper']) {
        element.children.forEach((child) => {
          if ('properties' in child && child.properties) {
            child.properties.style = '';
          }
        });
      }

      element.properties.style = '';
      element.properties['data-word-id'] = id;
    }
  },
  onVisitTitle(element) {
    element.tagName = 'h2';
  },
  onVisitCaption(element) {
    element.tagName = 'figcaption';
  },
});
