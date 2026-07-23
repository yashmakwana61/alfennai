import type { Metadata } from "next";
import type { ToolConfig, ToolCategory } from "@/types/tool";
import type { AgentConfig, AgentIndustry } from "@/types/agent";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alfennai.com";
export const SITE_NAME = "AlfennAI";

export function buildToolMetadata(tool: ToolConfig): Metadata {
  const url = `${SITE_URL}/tools/${tool.category}/${tool.slug}`;
  const ogImage = tool.seo.ogImage ?? `${SITE_URL}/api/og?title=${encodeURIComponent(tool.title)}`;

  return {
    title: `${tool.seo.metaTitle} | ${SITE_NAME}`,
    description: tool.seo.metaDescription,
    keywords: tool.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.seo.metaTitle,
      description: tool.seo.metaDescription,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: tool.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seo.metaTitle,
      description: tool.seo.metaDescription,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export function buildCategoryMetadata(category: ToolCategory): Metadata {
  const url = `${SITE_URL}/tools/${category.slug}`;
  return {
    title: `${category.name} - Free Online ${category.name} | ${SITE_NAME}`,
    description: category.description,
    alternates: { canonical: url },
    openGraph: {
      title: category.name,
      description: category.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export function buildAgentMetadata(agent: AgentConfig): Metadata {
  const url = `${SITE_URL}/agents/${agent.industry}/${agent.slug}`;
  return {
    title: `${agent.seo.metaTitle} | ${SITE_NAME}`,
    description: agent.seo.metaDescription,
    keywords: agent.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: agent.seo.metaTitle,
      description: agent.seo.metaDescription,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: agent.seo.metaTitle,
      description: agent.seo.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export function buildAgentIndustryMetadata(industry: AgentIndustry): Metadata {
  const url = `${SITE_URL}/agents/${industry.slug}`;
  return {
    title: `${industry.name} AI Agents - Free Downloadable Workflows | ${SITE_NAME}`,
    description: industry.description,
    alternates: { canonical: url },
    openGraph: { title: industry.name, description: industry.description, url, siteName: SITE_NAME, type: "website" },
  };
}
