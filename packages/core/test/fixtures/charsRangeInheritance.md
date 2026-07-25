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

Splitting a token around an occurrence the range excludes must not let the
fragments on either side spell a new one. `coconnection` holds a single
`con`, so `/con/2` has nothing to highlight and must leave the code intact —
`co` and `nection` must not join into a second `con`.

```js /con/2
coconnection;
```

The same joining must not consume a number either: the `lo` inside `balloon`
is the first occurrence, so `/lo/2` has to reach the `lo` on the next line.

```js /lo/2
balloon;
lo;
```

A highlighted occurrence leaves the same kind of gap, so an unranged pattern
has to hold too: `/con/` highlights the one `con` in `coconnection` and
leaves the rest of the code untouched.

```js /con/
coconnection;
```
