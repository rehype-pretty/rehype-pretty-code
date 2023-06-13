import {unified} from 'unified';
import rehypePrettyCode from './src';

unified().use(rehypePrettyCode, {
  theme: 'one-dark-pro',
  keepBackground: true,
  onVisitLine(element) {
    if (element.children.length === 0) {
      element.children = [{type: 'text', value: ' '}];
    }
  },
  onVisitHighlightedLine(element) {
    element.properties.className?.push('highlighted');
  },
  onVisitHighlightedWord(element) {
    element.properties.className = ['word'];
  },
});
