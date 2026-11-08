---
"rehype-pretty-code": patch
---

fix: color inline tokens such as `` `const{:.keyword}` `` when a JSON theme has no `name`, instead of silently falling back to `inherit` (#244)
