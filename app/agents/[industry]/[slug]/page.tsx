import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAgentBySlug,
  getAllAgentSlugsWithIndustry,
  getRelatedAgents,
  getIndustryBySlug,
} from "@/lib/engine/agent-registry";
import { buildAgentMetadata } from "@/seo/metadata";
import { buildAgentHowToSchema, buildAgentFAQSchema, buildBreadcrumbSchema } from "@/seo/schema";
import { AgentPageLayout } from "@/components/agents/AgentPageLayout";

interface PageProps {
  params: Promise<{ industry: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllAgentSlugsWithIndustry();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) return {};
  return buildAgentMetadata(agent);
}

export default async function AgentPage({ params }: PageProps) {
  const { industry, slug } = await params;
  const agent = getAgentBySlug(slug);
  const agentIndustry = getIndustryBySlug(industry);

  if (!agent || !agentIndustry || agent.industry !== industry) {
    notFound();
  }

  const relatedAgents = getRelatedAgents(agent);
  const howToSchema = buildAgentHowToSchema(agent);
  const faqSchema = buildAgentFAQSchema(agent);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "AI Agents", path: "/agents" },
    { name: agentIndustry.name, path: `/agents/${agentIndustry.slug}` },
    { name: agent.title, path: `/agents/${agent.industry}/${agent.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AgentPageLayout agent={agent} industry={agentIndustry} relatedAgents={relatedAgents} />
    </>
  );
}
