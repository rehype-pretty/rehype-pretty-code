---
"rehype-pretty-code": patch
---

fix: prevent an infinite loop in inline character highlighting when a pattern matches text that spans multiple syntax tokens and occurs more than once on the same line (#185)
