import * as React from 'react';
import { Code } from '@/app/code';
import { Footer } from '@/app/footer';

const exampleSnippets = [
  {
    title: 'With line numbers',
    snippet: `
\`\`\`ts {4} showLineNumbers
const add = (a: number, b: number): number => a + b;
\`\`\`
`,
  },
  {
    title: 'With title and line numbers',
    snippet: `
\`\`\`rust title="fib.erl" showLineNumbers
-spec is_palindrome(X :: integer()) -> boolean().
-import(lists, [reverse/1]).

is_palindrome(X) ->
    S = integer_to_list(X),
    R = reverse(S),
    S =:= R.
\`\`\`
`,
  },
  {
    title: 'With title, line numbers, and character highlighting',
    snippet: `
\`\`\`elixir title="fib.ex" showLineNumbers /palindrome/#v
defmodule Solution do
  @spec is_palindrome(x :: integer) :: boolean
  def is_palindrome(x) when x < 0, do: false
  def is_palindrome(x), do: do_is_palindrome(x, get_base_10(x, 1))

  defp do_is_palindrome(x, b10) when b10 > 1,
    do: get_first_digit(x, b10) == rem(x, 10) and do_is_palindrome(div(x, 10), div(b10, 100))

  defp do_is_palindrome(_, _), do: true

  defp get_first_digit(n, b10), do: div(n, b10) |> rem(10)

  defp get_base_10(n, b10) when n >= b10, do: get_base_10(n, b10 * 10)
  defp get_base_10(n, b10), do: div(b10, 10)
end
\`\`\``,
  },
];

export default async function ServerComponentPage() {
  return (
    <React.Fragment>
      <main className="max-w-2xl mx-auto text-gray-300/70 px-4 sm:px-6 md:px-8 mt-12 mb-6 relative z-1">
        {exampleSnippets.map((snippet) => (
          <div key={snippet.title} className="overflow-scroll">
            <h5>{snippet.title}:</h5>
            <Code code={snippet.snippet} />
          </div>
        ))}
      </main>
      <Footer />
    </React.Fragment>
  );
}
