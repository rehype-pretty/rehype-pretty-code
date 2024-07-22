'use client';

import * as React from 'react';
import Index from '@/app/index.mdx';
import { Header } from '@/app/header';
import { Footer } from '@/app/footer';
import { MDXProvider } from '@mdx-js/react';
import { registerCopyButton } from '@rehype-pretty/transformers';

function Heading({
  level,
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const tag = `h${level}`;
  return React.createElement(
    tag,
    props,
    <a href={`#${props.id}`}>{children}</a>,
  );
}

export default function Home() {
  React.useEffect(() => {
    registerCopyButton();
  }, []);
  return (
    <>
      <Header />
      <main>
        <div className="prose prose-invert text-gray-300/70 px-4 sm:px-6 md:px-8 mx-auto mt-12 mb-6 relative z-1">
          <article>
            <MDXProvider
              disableParentContext={false}
              components={{
                h1: (props) => <Heading level={1} {...props} />,
                h2: (props) => <Heading level={2} {...props} />,
                h3: (props) => <Heading level={3} {...props} />,
                h4: (props) => <Heading level={4} {...props} />,
                h5: (props) => <Heading level={5} {...props} />,
                h6: (props) => <Heading level={6} {...props} />,
              }}
            >
              <Index />
            </MDXProvider>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
