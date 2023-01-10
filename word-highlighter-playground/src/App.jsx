import React, {useRef, useState} from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2';

import {getHighlighter, setCDN} from 'shiki';
import htmlParser from 'prettier/parser-html';

import {unified} from 'unified';
import rehypeParse from 'rehype-parse';
import prettier from 'prettier/standalone';
import {toHtml} from 'hast-util-to-html';
import rangeParser from 'parse-numeric-range';
import wordHighlighter from '../../src/word-highlighter';

import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/css/css.js';

import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

const initialValue = `const test = () => {
  return 'hello world';
}`;
const DEFAULT_THEME = 'nord';

const hastParser = unified().use(rehypeParse, {fragment: true});

function App() {
  const [value, setValue] = useState();
  const [HTML, setHTML] = useState();
  const [isLoaded, setIsLoaded] = useState();
  const [word, setWord] = useState(['test', 'hello', 'world']);
  const [mode, setMode] = useState('javascript');
  const [wordNumbers, setWordNumbers] = useState('');
  const highlighter = useRef();
  const editorRef = useRef();
  const htmlRef = useRef();

  const [formattedHTML, setFormattedHTML] = useState();

  React.useEffect(() => {
    const getShiki = async () => {
      setCDN('https://unpkg.com/shiki/');
      const highlighterPromise = getHighlighter({
        theme: DEFAULT_THEME,
        langs: ['js', 'html', 'css'],
      });

      const hi = await highlighterPromise;
      highlighter.current = hi;
      setIsLoaded(true);
    };
    getShiki();
  }, []);

  const onHighlightWord = (node) => {
    node.properties.className = ['word'];
  };

  React.useEffect(() => {
    if (isLoaded) {
      setValue(initialValue);
    }
  }, [isLoaded]);

  const codeMirrorOnChange = React.useCallback(() => {
    if (highlighter.current && editorRef.current) {
      setHTML(
        highlighter.current.codeToHtml(
          editorRef.current.getDoc().getValue('\n'),
          mode,
          DEFAULT_THEME
        )
      );
    }
    if (highlighter.current) {
      setFormattedHTML(
        highlighter.current.codeToHtml(
          prettier.format(htmlRef.current.innerHTML, {
            parser: 'html',
            plugins: [htmlParser],
          }),
          'html',
          DEFAULT_THEME
        )
      );
    }
  }, [mode]);

  const highlightWords = React.useCallback(
    (container) => {
      if (word && editorRef.current) {
        container.innerHTML = highlighter.current.codeToHtml(
          editorRef.current.getDoc().getValue('\n'),
          mode,
          DEFAULT_THEME
        );
      }
      let options = {
        wordNumbers: word.map(() => rangeParser(wordNumbers)),
        wordIdsMap: new Map(),
        wordCounter: new Map(),
      };
      if (container && container.querySelector('.line')) {
        container.querySelectorAll('.line').forEach((node) => {
          const n = hastParser.parse(node.innerHTML);
          wordHighlighter(n, word, options, onHighlightWord);
          node.innerHTML = toHtml(n);
        });
      }
      if (container.textContent.trim() !== value.trim()) {
        console.warn(
          `Something went wrong with highlighting!
          
          expect: ${container.textContent}
          got: ${value}`
        );
      }
    },
    [word, wordNumbers, value, mode]
  );

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
          <select id="mode-select" onChange={(e) => setMode(e.target.value)}>
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
              mode: mode === 'html' ? 'xml' : mode,
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
          <p>result</p>

          <div
            ref={htmlRef}
            className="shiki-output"
            dangerouslySetInnerHTML={{__html: HTML}}
          ></div>
        </div>
      </section>
      <section>
        <p>output</p>
        <div
          className="shiki-output--html shiki-output"
          dangerouslySetInnerHTML={{
            __html: htmlRef.current && highlighter.current && formattedHTML,
          }}
        />
      </section>
    </main>
  );
}

export default App;
