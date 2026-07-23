import type { ToolConfig } from "@/types/tool";
import type { AgentConfig } from "@/types/agent";
import { SITE_URL, SITE_NAME } from "./metadata";

export function buildSoftwareApplicationSchema(tool: ToolConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web-based)",
    url: `${SITE_URL}/tools/${tool.category}/${tool.slug}`,
    description: tool.seo.metaDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1",
    },
  };
}

export function buildFAQSchema(tool: ToolConfig) {
  if (!tool.faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  crumbs: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
}

export function buildAgentHowToSchema(agent: AgentConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: agent.title,
    description: agent.seo.metaDescription,
    step: [
      { "@type": "HowToStep", name: "Download", text: "Download the prompt and n8n workflow JSON files." },
      { "@type": "HowToStep", name: "Import", text: "Import the workflow JSON into n8n (or rebuild the logic in Make.com)." },
      { "@type": "HowToStep", name: "Connect credentials", text: "Add your own API credentials to each placeholder node." },
      { "@type": "HowToStep", name: "Activate", text: "Wire up your trigger source and activate the workflow." },
    ],
  };
}

export function buildAgentFAQSchema(agent: AgentConfig) {
  if (!agent.faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: agent.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
