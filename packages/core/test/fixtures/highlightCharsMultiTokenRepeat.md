# Highlight chars spanning multiple tokens, repeated

A pattern whose match spans multiple syntax-highlighting tokens and
occurs more than once on the same line should highlight every
occurrence without hanging (see issue #185).

/Math.sin/

```js /Math.sin/
const s = Math.sin(x) + Math.sin(y);
```

/c.json/

```js /c.json/
c.json(); c.json();
```

/'a/

```rust /'a/
fn f<'a, 'b>(x: &'a str) -> &'a str { x }
```
