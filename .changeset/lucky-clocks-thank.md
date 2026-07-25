---
"rehype-pretty-code": patch
---

fix: stop character-highlight ranges leaking across patterns, so an id-only annotation like `/foo/#a` no longer makes a later pattern inherit the previous pattern's range, and a range-ignored occurrence no longer consumes the whole token it lives in (#169)

Note that an occurrence a range excludes is now split into its own span rather than left inside the surrounding token, so the emitted HTML around character ranges changes even where the visible highlighting does not.
