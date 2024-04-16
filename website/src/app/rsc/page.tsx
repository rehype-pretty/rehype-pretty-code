import * as React from 'react';
import { Code } from '@/app/code';
import { Footer } from '@/app/footer';

const exampleSnippets = [
  {
    title: 'With line numbers',
    snippet: `
\`\`\`ts {4} showLineNumbers
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`
`,
  },
  {
    title: 'With title',
    snippet: `
\`\`\`rust title="fib.rs"
fn fib(n: u64) -> u64 {
  if n <= 1 {
    return n;
  }
  fib(n - 1) + fib(n - 2)
}
\`\`\`
`,
  },
  {
    title: 'With character highlighting',
    snippet: `
\`\`\`bash /index/#v
#!/bin/bash
set -euo pipefail

function fib() {
  local number=$1; local a=0; local b=1
  for ((index = 0; index < number; index++)); do
    local temp=$a
    a=$b
    b=$((temp + b))
  done
  echo $a
}

fib $1
\`\`\``,
  },
];

export default async function ServerComponentPage() {
  return (
    <React.Fragment>
      <main className="min-h-screen flex flex-col space-y-3 prose prose-invert text-gray-300/70 px-4 sm:px-6 md:px-8 mx-auto mt-12 relative z-1">
        {exampleSnippets.map((snippet) => (
          <div key={snippet.title}>
            <h5>{snippet.title}:</h5>
            <Code code={snippet.snippet} />
          </div>
        ))}
      </main>
      <Footer />
    </React.Fragment>
  );
}
