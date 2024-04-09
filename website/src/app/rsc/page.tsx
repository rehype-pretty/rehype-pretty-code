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
