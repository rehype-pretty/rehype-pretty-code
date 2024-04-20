## Many line

```css
html {
  --page-color: white;
  --ink-color: black;
}

@media (prefers-color-scheme: dark) {
  html {
    --page-color: black;
    --ink-color: white;
  }
}

body {
  background-color: var(--page-color);
  color: var(--ink-color);
}

input {
  background-color: var(--page-color);
  color: var(--ink-color);
  border-color: var(--ink-color);
}

button {
  background-color: var(--ink-color);
  color: var(--page-color);
}
```
