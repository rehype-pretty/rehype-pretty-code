# showLineNumbers after highlight tokens (#204)

showLineNumbers at the start (already worked):

```js showLineNumbers /const/
const answer = 42;
```

showLineNumbers at the end, after highlight tokens (#204):

```js /const/ showLineNumbers
const answer = 42;
```

showLineNumbers{5} at the end, after highlight tokens (#204):

```js /const/ showLineNumbers{5}
const answer = 42;
```

showLineNumbers inside a multi-word highlight is highlight text, not an
option, so no line numbers here:

```js /foo showLineNumbers bar/
const value = 'foo showLineNumbers bar';
```

The same word as a real option alongside a multi-word highlight that also
contains it — line numbers, and both occurrences highlighted:

```js /foo showLineNumbers bar/ showLineNumbers
const value = 'foo showLineNumbers bar';
```
