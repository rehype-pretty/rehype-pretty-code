'use client';

import Index from './index.mdx';
import * as React from 'react';
import { Footer } from '@/app/footer';
import { MDXProvider } from '@mdx-js/react';

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
  const Tag = `h${level}`;
  return React.createElement(
    Tag,
    props,
    <a href={`#${props.id}`}>{children}</a>,
  );
}

export default function Home() {
  return (
    <>
      <header
        className="flex items-center pt-[4rem] pb-[35rem] -mb-[35rem]"
        style={{
          background: `linear-gradient(
            0deg,
            hsl(240deg 6% 10%) 0%,
            hsl(232deg 13% 13%) 17%,
            hsl(225deg 20% 17%) 28%,
            hsl(220deg 27% 20%) 37%,
            hsl(215deg 34% 22%) 44%,
            hsl(213deg 34% 25%) 51%,
            hsl(215deg 28% 29%) 57%,
            hsl(216deg 23% 33%) 63%,
            hsl(218deg 19% 37%) 68%,
            hsl(219deg 16% 41%) 73%,
            hsl(256deg 10% 46%) 78%,
            hsl(308deg 9% 49%) 82%,
            hsl(341deg 14% 55%) 85%,
            hsl(3deg 17% 60%) 89%,
            hsl(12deg 19% 61%) 91%,
            hsl(11deg 18% 62%) 94%,
            hsl(11deg 17% 63%) 96%,
            hsl(10deg 15% 64%) 98%,
            hsl(10deg 13% 65%) 100%
          )`,
        }}
      >
        <h1 className="mx-auto font-mono text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-amber-100/70 mb-8">
          rehype-pretty-code
        </h1>
      </header>
      <main>
        <div className="prose prose-invert text-gray-300/70 px-4 sm:px-6 md:px-8 mx-auto mt-12 mb-6 relative z-1">
          <article>
            <MDXProvider
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
