# Chars range inheritance (#169)

A ranged pattern must not leak its range onto a later plain pattern that
shares a token. `/Length/` has no range, so it highlights on both lines,
even though `/get/1` restricts `get` to its first occurrence.

```js /get/1 /Length/
const getStringLength = str => str.length;
const getStringLength = str => str.length;
```

An id-only annotation (`/get/#a`) has no range, so `get` highlights
everywhere while `/Length/2` restricts `Length` to its second occurrence.

```js /get/#a /Length/2
const getStringLength = str => str.length;
const getStringLength = str => str.length;
```
