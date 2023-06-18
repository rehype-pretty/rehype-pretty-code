import Index from './index.mdx';

export default function Home() {
  return (
    <div className="prose lg:prose-xl dark:prose-invert container px-4 mx-auto mt-12 mb-6 prose-strong:text-zinc-300">
      <h1 className="py-1 mx-auto mt-12 text-4xl sm:text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Rehype Pretty Code
      </h1>
      <main>
        <article className="text-zinc-400 prose prose-invert">
          <Index />
        </article>
      </main>
      <footer className="prose w-full max-w-none dark:prose-invert text-center border-t border-zinc-800 py-12 text-zinc-200 mt-16">
        Created by <a href="https://twitter.com/atomiksdev">@atomiks</a>,{' '}
        <a href="https://twitter.com/ren_riz">@ren_riz</a>,{' '}
        <a href="https://twitter.com/silvenon">@silvenon</a>,{' '}
        <a href="https://github.com/ttwrpz">@ttwrpz</a>, and other contributors
      </footer>
    </div>
  );
}
