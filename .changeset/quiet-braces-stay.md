---
"rehype-pretty-code": patch
---

fix: treat braces inside a character highlight such as `/{1}/` or `"{3-4}"` as highlight text, so they no longer also highlight lines or give a line its id (#232)
