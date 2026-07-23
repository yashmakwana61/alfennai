import Link from "next/link";
import * as Icons from "lucide-react";
import { CATEGORY_REGISTRY, getFeaturedTools, getTrendingTools } from "@/lib/engine/registry";

export default function HomePage() {
  const featured = getFeaturedTools();
  const trending = getTrendingTools();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid-pattern px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Every tool you need.
            <br />
            <span className="text-primary">In one place.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Free, fast, beautifully designed calculators, converters and generators.
            No sign-up. No clutter.
          </p>
          <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Icons.Search className="h-5 w-5 text-slate-400" />
            <input
              placeholder="Search calculators, converters, generators..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Popular categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_REGISTRY.map((category) => {
            const Icon = (Icons as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Wrench;
            return (
              <Link
                key={category.slug}
                href={`/tools/${category.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="rounded-xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{category.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured tools */}
      <ToolGrid title="Featured tools" tools={featured} />
      <ToolGrid title="Trending now" tools={trending} />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {[
            { q: "Is AlfennAI free to use?", a: "Yes, every tool is completely free with no sign-up required." },
            { q: "Do you store the data I enter into tools?", a: "No. Almost all tools run entirely in your browser and never send your data to a server." },
            { q: "How often are new tools added?", a: "New tools are added regularly across all categories, from calculators to developer utilities." },
          ].map((item) => (
            <details key={item.q} className="py-4">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-secondary px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">Get new tools in your inbox</h2>
          <p className="mt-2 text-slate-300">No spam. Unsubscribe anytime.</p>
          <form className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none"
            />
            <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ToolGrid({ title, tools }: { title: string; tools: ReturnType<typeof getFeaturedTools> }) {
  if (!tools.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = (Icons as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.category}/${tool.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-medium text-slate-900 dark:text-white">{tool.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.shortDescription}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
