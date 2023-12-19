import React, { useRef, useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';

import { getHighlighter } from 'shikiji';
import htmlParser from 'prettier/plugins/html';

import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import prettier from 'prettier/standalone';
import { toHtml } from 'hast-util-to-html';
import rangeParser from 'parse-numeric-range';
import { charsHighlighter } from '../../../src/chars/charsHighlighter';

import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/css/css.js';

import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

const initialValue = `const test = () => {
  return 'hello world';
}`;

const hastParser = unified().use(rehypeParse, { fragment: true });

function App() {
  const [value, setValue] = useState();
  const [HTML, setHTML] = useState();
  const [word, setWord] = useState(['test', 'hello', 'world']);
  const [lang, setLang] = useState('js');
  const [wordNumbers, setWordNumbers] = useState('');
  const [formattedHTML, setFormattedHTML] = useState();
  const [highlighter, setHighlighter] = useState();
  const editorRef = useRef();
  const htmlRef = useRef();

  React.useEffect(() => {
    const getShiki = async () => {
      setHighlighter(
        await getHighlighter({
          themes: ['github-dark-dimmed'],
          langs: ['js', 'html', 'css'],
        }),
      );
      setValue(initialValue);
    };
    getShiki();
  }, []);

  const onHighlightWord = (node) => {
    node.properties.className = ['word'];
  };

  const codeMirrorOnChange = React.useCallback(async () => {
    if (highlighter && editorRef.current) {
      setHTML(
        highlighter.codeToHtml(editorRef.current.getDoc().getValue('\n'), {
          lang,
          theme: 'github-dark-dimmed',
        }),
      );
    }
    if (highlighter) {
      const html = highlighter.codeToHtml(
        await prettier.format(htmlRef.current.innerHTML, {
          parser: 'html',
          plugins: [htmlParser],
        }),
        { lang: 'html', theme: 'github-dark-dimmed' },
      );

      setFormattedHTML(html);
    }
  }, [lang, highlighter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const highlightWords = React.useCallback(
    (container) => {
      if (word && editorRef.current) {
        container.innerHTML = highlighter.codeToHtml(
          editorRef.current.getDoc().getValue('\n'),
          {
            lang,
            theme: 'github-dark-dimmed',
          },
        );
      }
      const options = {
        ranges: word.map(() => rangeParser(wordNumbers)),
        idsMap: new Map(),
        counterMap: new Map(),
      };
      if (container?.querySelector('.line')) {
        container.querySelectorAll('.line').forEach((node) => {
          const n = hastParser.parse(node.innerHTML);
          charsHighlighter(n, word, options, onHighlightWord);
          node.innerHTML = toHtml(n);
        });
      }
      if (container.textContent.trim() !== value.trim()) {
        console.warn(
          `Something went wrong with highlighting!
          
          expect: ${container.textContent}
          got: ${value}`,
        );
      }
    },
    [word, wordNumbers, value, lang, highlighter],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (htmlRef.current && HTML) {
      highlightWords(htmlRef.current);
    }
  }, [htmlRef, HTML, highlightWords]);

  return (
    <main className="App">
      <header className="App-header">
        <h1>Word Highlighter Playground</h1>
      </header>
      <section className="options-container">
        <div>
          <label htmlFor="word-input">Highlighted word/string:</label>
          <input
            id="word-input"
            value={word}
            onChange={(e) => setWord(e.target.value.split(','))}
          />
        </div>
        <div>
          <label htmlFor="word-input">
            Restrict highlighting to nth occurrence (range)
          </label>
          <input
            value={wordNumbers}
            placeholder="e.g 1,3"
            onChange={(e) => setWordNumbers(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="mode-select">Highlighter lang</label>
          <select id="mode-select" onChange={(e) => setLang(e.target.value)}>
            <option>javascript</option>
            <option>html</option>
            <option>css</option>
          </select>
        </div>
      </section>
      <section className="grid">
        <div>
          <p>Input</p>

          <CodeMirror
            value={value}
            options={{
              mode: lang === 'html' ? 'xml' : lang,
              theme: 'material',
              lineNumbers: true,
            }}
            onBeforeChange={(editor, data, value) => {
              setValue(value);
            }}
            onChange={(editor) => {
              if (!editorRef.current) editorRef.current = editor;
              codeMirrorOnChange();
            }}
          />
        </div>
        <div>
          <p>Result</p>
          <div
            ref={htmlRef}
            className="shiki-output"
            dangerouslySetInnerHTML={{ __html: HTML }}
          />
        </div>
      </section>
      <section>
        <p>Output</p>
        <div
          className="shiki-output--html shiki-output"
          dangerouslySetInnerHTML={{ __html: formattedHTML }}
        />
      </section>
    </main>
  );
}

export default App;
