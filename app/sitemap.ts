import type { MetadataRoute } from "next";
import { TOOL_REGISTRY, getPopulatedCategories } from "@/lib/engine/registry";
import { AGENT_REGISTRY, getPopulatedIndustries } from "@/lib/engine/agent-registry";
import { SITE_URL } from "@/seo/metadata";

/**
 * Phase 12 sitemap: only useful, indexable, canonical pages.
 * Excludes empty categories, empty agent industries and noindex pages.
 * Static pages listed here must all exist as real routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/methodology`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/agents`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = getPopulatedCategories().map((c) => ({
    url: `${SITE_URL}/tools/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolRoutes: MetadataRoute.Sitemap = TOOL_REGISTRY.map((t) => ({
    url: `${SITE_URL}/tools/${t.category}/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const agentIndustryRoutes: MetadataRoute.Sitemap = getPopulatedIndustries().map((i) => ({
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
