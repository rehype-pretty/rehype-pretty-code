---
"rehype-pretty-code": patch
---

fix: detect `showLineNumbers` wherever it appears in the meta string, not only before the highlight annotations, while ignoring the word when it is part of a character highlight such as `/foo showLineNumbers bar/` (#204)
