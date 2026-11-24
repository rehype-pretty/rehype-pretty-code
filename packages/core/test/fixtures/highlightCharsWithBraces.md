# Highlighted chars containing braces (#232)

Braces inside a char annotation are highlight text, not a line range, so
only the chars are highlighted here, with either delimiter:

````md showLineNumbers{16} /{1}/#a /{3-4}/#a
```js {1} /{3-4}/
const a = 1;
```
````

````md "{1}" "{3-4}"
```js {1} /{3-4}/
const a = 1;
```
````

A real line range next to a char annotation with braces keeps only its own
lines, and `{2}#a` inside the annotation does not give line 2 an id:

```js {2} /{1}/ {4}
const a = {1};
const b = 2;
const c = 3;
const d = 4;
```

```js {2} /{2}#a/
const a = 1;
const b = '{2}#a';
```
