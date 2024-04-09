## Highlighted lines with showLineNumbersAt

{1, 3, 6-8} showLineNumbers{3}

```js {1, 3, 6-8} showLineNumbers{3}
const getStringLength = (str) => str.length;

const add = (a, b) => a + b;

const divide = (a, b) => a / b;

const subtract = (a, b) => a - b;

const multiply = (a, b) => a * b;
```

showLineNumbers{3} {1, 3, 6-8}

```js showLineNumbers{3} {1, 3, 6-8}
const getStringLength = (str) => str.length;

const add = (x, y) => x + y;

const divide = (x, y) => x / y;

const subtract = (x, y) => x - y;

const multiply = (x, y) => x * y;
```

showLineNumbers{3} {2,4-5}

```js showLineNumbers{3} {2,4-5}
// should not be highlighted
// should be highlighted
// should not be highlighted
// should be highlighted
// should be highlighted
// should not be highlighted
```

{2,4-5} showLineNumbers{3}

```js {2,4-5} showLineNumbers{3}
// should not be highlighted
// should be highlighted
// should not be highlighted
// should be highlighted
// should be highlighted
// should not be highlighted
```

showLineNumbers{3} {2-4}

```js showLineNumbers{3} {2-4}
// should not be highlighted
// should be highlighted
// should be highlighted
// should be highlighted
// should not be highlighted
```

{2-4} showLineNumbers{3}

```js {2-4} showLineNumbers{3}
// should not be highlighted
// should be highlighted
// should be highlighted
// should be highlighted
// should not be highlighted
```
