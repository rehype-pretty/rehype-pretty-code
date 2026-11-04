---
'rehype-pretty-code': patch
---

Fix: inline code highlighted with a `{:.token}` suffix is now always rendered as text. Previously its content was interpolated into an HTML string and re-parsed, so untrusted Markdown could inject HTML elements and attributes. As a result, entities in token code such as `&lt;` now display as written, matching the `{:lang}` syntax.
