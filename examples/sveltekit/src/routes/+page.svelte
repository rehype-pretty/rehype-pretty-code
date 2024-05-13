<script lang="ts">
import type { PageData } from './$types.ts';

export let data: PageData;
</script>

<p class="text-4xl font-extrabold mb-3 font-display">{data.title}</p>

<section class="space-y-1 w-full max-w-[600px]">
  {#each data.snippets as { code }}
    {@html code}
  {/each}
</section>

<a
  target="_blank"
  rel="noopener noreferrer"
  href="https://github.com/rehype-pretty/rehype-pretty-code/tree/master/examples/sveltekit"
  class="top-0 right-0 absolute p-1 pl-1.5 text-sm text-zinc-900 font-semibold rounded-bl-md bg-[#d89c9c]"
>
  source code
</a>

<style>
  :global(pre),
  :global(code),
  :global(figure) {
    border-radius: 5px;
    overflow-x: auto;
    padding: 5px 6px 6px 6px;
  }

  :global(figcaption) {
    color: #333;
    margin-top: 5px;
    font-weight: 500;
    font-size: 1.1rem;
  }
</style>
