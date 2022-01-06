import Head from 'next/head';
// @ts-ignore — using @mdx-js/react v1 as v2.0.0-rc.2 causes a crash
import {MDXProvider} from '@mdx-js/react';

export function Layout({children}: {children: React.ReactNode}) {
  return (
    <>
      <Head>
        <title>MDX Pretty Code</title>
        <meta
          name="description"
          content="Beautiful syntax highlighting for your MDX docs"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="prose lg:prose-xl dark:prose-invert container px-4 mx-auto mt-12 mb-24">
        <h1
          className="text-zinc-100 mx-auto mt-12 text-4xl sm:text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{lineHeight: '1.2'}}
        >
          MDX Pretty Code
        </h1>

        <article className="text-zinc-400">
          <MDXProvider
            components={{
              span(props: Record<string, any>) {
                if (props['data-mdx-pretty-code'] != null) {
                  return (
                    <code
                      data-theme={props['data-theme']}
                      style={{color: props['data-color']}}
                    >
                      {props.children.props.children}
                    </code>
                  );
                }

                return <span {...props} />;
              },
            }}
          >
            {children}
          </MDXProvider>
        </article>
      </div>

      <footer className="prose w-full max-w-none dark:prose-invert text-center border-t border-zinc-800 py-12">
        Created by <a href="https://twitter.com/atomiksdev">@atomiks</a> and{' '}
        <a href="https://twitter.com/ren_riz">@ren_riz</a>
      </footer>
    </>
  );
}
