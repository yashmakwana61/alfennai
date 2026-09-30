import Link from "next/link";
import * as Icons from "lucide-react";
import { TOOL_REGISTRY, getFeaturedTools, getTrendingTools, getPopulatedCategories } from "@/lib/engine/registry";
import { getFeaturedAgents } from "@/lib/engine/agent-registry";
import { AdSlot } from "@/components/ads/AdSlot";
import { ToolSearch } from "@/components/search/ToolSearch";

export default function HomePage() {
  const featured = getFeaturedTools();
  const trending = getTrendingTools();
  const featuredAgents = getFeaturedAgents();
  const populatedCategories = getPopulatedCategories();

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
            {TOOL_REGISTRY.length} free, fast calculators, converters and generators.
            No sign-up. No clutter.
          </p>
          <ToolSearch variant="hero" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Popular:{" "}
            <Link href="/tools/finance/salary-calculator" className="underline hover:text-primary">Salary Calculator</Link>
            {" · "}
            <Link href="/tools/finance/ctc-to-in-hand" className="underline hover:text-primary">CTC to In-Hand</Link>
            {" · "}
            <Link href="/tools/finance/pf-calculator" className="underline hover:text-primary">PF Calculator</Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot label="Top banner ad" minHeight={90} />
      </div>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Popular categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {populatedCategories.map((category) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Wrench;
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

      {/* AI Agents */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Free AI Agents & n8n Workflows</h2>
          <Link href="/agents" className="text-sm font-medium text-primary hover:underline">View all →</Link>
        </div>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          Industry-specific AI agent prompts with a ready-to-import n8n workflow -- download the
          prompt, download the workflow, plug in your own credentials.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredAgents.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.industry}/${agent.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="font-medium text-slate-900 dark:text-white">{agent.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{agent.shortDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured tools */}
      <ToolGrid title="Featured tools" tools={featured} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot label="Inline ad" minHeight={120} />
      </div>

      <ToolGrid title="Trending now" tools={trending} />

      {/* Trust / methodology */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">How our calculators work</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
            Financial calculators on AlfennAI are built from official rules, tested against
            verified examples, and show their assumptions next to every result. Salary, HRA,
            PF, gratuity and professional tax estimates explain what is included, what is not,
            and where to verify regulated rules.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/methodology" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
              Read our methodology
            </Link>
            <Link href="/tools/finance" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200">
              Browse finance calculators
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {[
            { q: "Is AlfennAI free to use?", a: "Yes, every tool is completely free with no sign-up required." },
            { q: "Do you store the data I enter into tools?", a: "No. Calculators and converters run in your browser. Your inputs are never sent to a server, stored, or used for analytics." },
            { q: "Are financial calculator results exact?", a: "No. They are estimates based on simplified models of official rules. Always verify regulated tax and labour rules against official sources or a professional before relying on them." },
            { q: "How often are new tools added?", a: "New tools are added regularly across all categories, from calculators to developer utilities." },
          ].map((item) => (
            <details key={item.q} className="py-4">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </details>
          ))}
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
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
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
