import Head from 'next/head';
// @ts-ignore — using @mdx-js/react v1 as v2.0.0-rc.2 causes a crash
import {MDXProvider} from '@mdx-js/react';
import React from 'react';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[\s./]/g, '-')
    .replace(/[.:'"`!$%^&*@#?<>:;(){}|=+/\[\]]/g, '');

const linkify =
  (Tag: string) =>
  ({children, ...props}: any) => {
    const url = slugify(
      typeof children !== 'string' ? children.props.children : children
    );
    return (
      <Tag {...props} id={url}>
        <a href={`#${url}`} className="inline-block">
          {children}
        </a>
      </Tag>
    );
  };

export function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <>
      <Head>
        <title>Rehype Pretty Code</title>
        <meta
          name="description"
          content="Beautiful code blocks for your MD/MDX docs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="prose lg:prose-xl dark:prose-invert container px-4 mx-auto mt-12 mb-24">
        <h1
          className="text-zinc-100 mx-auto mt-12 text-4xl sm:text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{lineHeight: '1.2'}}
        >
          Rehype Pretty Code
        </h1>

        <article className="text-zinc-400">
          <MDXProvider
            components={{
              h2: linkify('h2'),
              h3: linkify('h3'),
              h4: linkify('h4'),
              h5: linkify('h5'),
              h6: linkify('h6'),
            }}
          >
            {children}
          </MDXProvider>
        </article>
      </div>

      <footer className="prose w-full max-w-none dark:prose-invert text-center border-t border-zinc-800 py-12 text-zinc-200">
        Created by <a href="https://twitter.com/atomiksdev">@atomiks</a>,{' '}
        <a href="https://twitter.com/ren_riz">@ren_riz</a>,{' '}
        <a href="https://twitter.com/silvenon">@silvenon</a>,{' '}
        <a href="https://github.com/ttwrpz">@ttwrpz</a>, and other contributors
      </footer>
    </>
  );
}
