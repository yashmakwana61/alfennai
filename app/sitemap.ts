import type { MetadataRoute } from "next";
import { TOOL_REGISTRY, CATEGORY_REGISTRY } from "@/lib/engine/registry";
import { AGENT_REGISTRY, AGENT_INDUSTRY_REGISTRY } from "@/lib/engine/agent-registry";
import { SITE_URL } from "@/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/agents`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_REGISTRY.map((c) => ({
    url: `${SITE_URL}/tools/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolRoutes: MetadataRoute.Sitemap = TOOL_REGISTRY.map((t) => ({
    url: `${SITE_URL}/tools/${t.category}/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const agentIndustryRoutes: MetadataRoute.Sitemap = AGENT_INDUSTRY_REGISTRY.map((i) => ({
    url: `${SITE_URL}/agents/${i.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const agentRoutes: MetadataRoute.Sitemap = AGENT_REGISTRY.map((a) => ({
    url: `${SITE_URL}/agents/${a.industry}/${a.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...agentIndustryRoutes, ...agentRoutes];
}
