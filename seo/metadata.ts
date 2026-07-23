import type { Metadata } from "next";
import type { ToolConfig, ToolCategory } from "@/types/tool";

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
