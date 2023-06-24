import Index from './index.mdx';

export default function Home() {
  return (
    <div className="prose prose-invert text-zinc-400 container px-4 mx-auto mt-12 mb-6">
      <h1 className="py-1 mx-auto mt-12 text-4xl sm:text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Rehype Pretty Code
      </h1>
      <main>
        <article>
          <Index />
        </article>
      </main>
      <footer className="w-full max-w-none dark:prose-invert text-center border-t border-zinc-800 py-12 mt-16">
        Created by <a href="https://twitter.com/atomiksdev">@atomiks</a>,{' '}
        <a href="https://twitter.com/ren_riz">@ren_riz</a>,{' '}
        <a href="https://twitter.com/silvenon">@silvenon</a>,{' '}
        <a href="https://github.com/ttwrpz">@ttwrpz</a>, and other contributors
      </footer>
    </div>
  );
}
