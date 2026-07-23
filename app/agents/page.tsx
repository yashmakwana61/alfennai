import Link from "next/link";
import type { Metadata } from "next";
import * as Icons from "lucide-react";
import { AGENT_INDUSTRY_REGISTRY, getFeaturedAgents } from "@/lib/engine/agent-registry";
import { SITE_NAME, SITE_URL } from "@/seo/metadata";

export const metadata: Metadata = {
  title: "Free AI Agents & n8n Workflows by Industry",
  description: `Download free, industry-specific AI agent prompts and ready n8n/Make workflows from ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/agents` },
};

export default function AgentsHubPage() {
  const featured = getFeaturedAgents();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">Free AI Agents & Workflows</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
        Industry-specific AI agent prompts, each with a ready-to-import n8n workflow. Download the
        prompt, download the workflow, plug in your own credentials, and it runs.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-slate-900 dark:text-white">Browse by industry</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {AGENT_INDUSTRY_REGISTRY.map((industry) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[industry.icon] ?? Icons.Bot;
          return (
            <Link
              key={industry.slug}
              href={`/agents/${industry.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{industry.name}</p>
            </Link>
          );
        })}
      </div>

      {featured.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-semibold text-slate-900 dark:text-white">Featured agents</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((agent) => (
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
        </>
      )}
    </main>
  );
}
