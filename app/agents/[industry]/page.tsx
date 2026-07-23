import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AGENT_INDUSTRY_REGISTRY, getIndustryBySlug, getAgentsByIndustry } from "@/lib/engine/agent-registry";
import { buildAgentIndustryMetadata } from "@/seo/metadata";
import type { AgentIndustrySlug } from "@/types/agent";

interface PageProps {
  params: Promise<{ industry: string }>;
}

export function generateStaticParams() {
  return AGENT_INDUSTRY_REGISTRY.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { industry } = await params;
  const ind = getIndustryBySlug(industry);
  if (!ind) return {};
  return buildAgentIndustryMetadata(ind);
}

export default async function AgentIndustryPage({ params }: PageProps) {
  const { industry } = await params;
  const ind = getIndustryBySlug(industry);
  if (!ind) notFound();

  const agents = getAgentsByIndustry(industry as AgentIndustrySlug);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{ind.name} AI Agents</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{ind.description}</p>

      {agents.length === 0 ? (
        <p className="mt-10 text-slate-500 dark:text-slate-400">Agents for this industry are coming soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
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
      )}
    </main>
  );
}
