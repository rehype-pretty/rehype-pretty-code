---
"rehype-pretty-code": patch
---

fix: stop character-highlight ranges leaking across patterns, so an id-only annotation like `/foo/#a` no longer makes a later pattern inherit the previous pattern's range, and a range-ignored occurrence no longer consumes the whole token it lives in (#169)

Range-excluded occurrences are counted without changing the token tree, so unhighlighted markup remains intact.

Partial highlights contained within a transformer-generated element preserve that surrounding semantic element instead of cloning it.
