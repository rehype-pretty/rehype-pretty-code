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
